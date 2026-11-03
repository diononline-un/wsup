// Schema for the Supplement Stack Calculator SaaS.
// Runs on PocketBase v0.40.x. Collection names follow the PRD.
migrate((app) => {
  // --- users: username-only auth, no email, no public signup rules ---
  const users = app.findCollectionByNameOrId("users")
  users.fields.add(new TextField({ name: "username", required: true, min: 3, max: 32, presentable: true }))
  users.fields.add(new SelectField({ name: "tier", values: ["basic", "pro"], maxSelect: 1 }))
  users.fields.add(new BoolField({ name: "recovery_verified" }))
  // 25-word seed phrase is the only recovery credential: email is optional and unused
  users.fields.getByName("email").required = false
  users.passwordAuth.identityFields = ["username"]
  users.listRule = "id = @request.auth.id"
  users.viewRule = "id = @request.auth.id"
  users.createRule = null
  users.updateRule = null
  users.deleteRule = null
  users.indexes.push("CREATE UNIQUE INDEX idx_users_username ON users (username)")
  app.save(users)

  const usersId = users.id

  // --- user_secrets: recovery hash, server-side only (rules = null) ---
  app.save(new Collection({
    type: "base",
    name: "user_secrets",
    fields: [
      { type: "relation", name: "user", collectionId: usersId, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "text", name: "recovery_hash", required: true, max: 128 },
      { type: "text", name: "recovery_salt", required: true, max: 64 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_user_secrets_user ON user_secrets (user)"],
  }))

  // --- user_profiles: biometrics, lifestyle, medications, cycle data ---
  app.save(new Collection({
    type: "base",
    name: "user_profiles",
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "user = @request.auth.id",
    updateRule: "user = @request.auth.id",
    deleteRule: null,
    fields: [
      { type: "relation", name: "user", collectionId: usersId, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "select", name: "units", values: ["metric", "imperial"], maxSelect: 1 },
      { type: "number", name: "age", min: 13, max: 120, onlyInt: true },
      { type: "number", name: "height_cm", min: 100, max: 250 },
      { type: "number", name: "weight_kg", min: 25, max: 400 },
      { type: "select", name: "biological_sex", values: ["female", "male", "intersex"], maxSelect: 1 },
      { type: "text", name: "gender_identity", max: 100 },
      { type: "select", name: "sleep_quality", values: ["poor", "fair", "good", "excellent"], maxSelect: 1 },
      { type: "number", name: "sleep_hours", min: 0, max: 16 },
      { type: "select", name: "activity_level", values: ["sedentary", "light", "moderate", "active", "athlete"], maxSelect: 1 },
      { type: "select", name: "caffeine_intake", values: ["none", "low", "moderate", "high"], maxSelect: 1 },
      { type: "text", name: "country", max: 2 },
      { type: "text", name: "allergies", max: 2000 },
      { type: "text", name: "medications", max: 2000 },
      { type: "text", name: "conditions", max: 2000 },
      { type: "select", name: "cycle_regular", values: ["not_applicable", "regular", "irregular", "unsure"], maxSelect: 1 },
      { type: "text", name: "cycle_symptoms", max: 2000 },
      { type: "bool", name: "disclaimer_acknowledged" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_user_profiles_user ON user_profiles (user)",
      "CREATE INDEX idx_user_profiles_country ON user_profiles (country)",
    ],
  }))

  // --- substances: research knowledge base, public read ---
  app.save(new Collection({
    type: "base",
    name: "substances",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { type: "text", name: "name", required: true, max: 120 },
      { type: "text", name: "slug", required: true, max: 120 },
      { type: "select", name: "category", values: ["vitamin", "mineral", "amino_acid", "peptide", "fatty_acid", "adaptogen", "medication", "other"], maxSelect: 1 },
      { type: "text", name: "description", max: 4000 },
      { type: "text", name: "typical_dose", max: 200 },
      { type: "select", name: "unit", values: ["mg", "g", "mcg", "iu", "ml", "custom"], maxSelect: 1 },
      { type: "text", name: "timing", max: 200 },
      { type: "select", name: "evidence_level", values: ["A", "B", "C", "D"], maxSelect: 1 },
      { type: "select", name: "tier_required", values: ["basic", "pro"], maxSelect: 1 },
      { type: "bool", name: "active" },
      { type: "text", name: "sources", max: 2000 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_substances_slug ON substances (slug)"],
  }))

  // --- substance_interactions: pairwise warnings / synergies ---
  const substancesId = app.findCollectionByNameOrId("substances").id
  app.save(new Collection({
    type: "base",
    name: "substance_interactions",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { type: "relation", name: "substance_a", collectionId: substancesId, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "relation", name: "substance_b", collectionId: substancesId, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "select", name: "severity", values: ["info", "caution", "high", "danger"], maxSelect: 1 },
      { type: "text", name: "mechanism", max: 2000 },
      { type: "text", name: "recommendation", max: 2000 },
      { type: "select", name: "evidence_level", values: ["A", "B", "C", "D"], maxSelect: 1 },
    ],
  }))

  // --- user_stacks: generated recommendations and BYOS entries ---
  app.save(new Collection({
    type: "base",
    name: "user_stacks",
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "user = @request.auth.id",
    updateRule: "user = @request.auth.id",
    deleteRule: "user = @request.auth.id",
    fields: [
      { type: "relation", name: "user", collectionId: usersId, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "text", name: "name", required: true, max: 120 },
      { type: "select", name: "kind", values: ["recommended", "byos"], maxSelect: 1 },
      // { name, dose, unit, times: ["08:00"], substanceId? } - free-form BYOS items
      { type: "json", name: "items", maxSize: 200000 },
      { type: "number", name: "matching_score", min: 0, max: 100 },
      { type: "number", name: "confidence_score", min: 0, max: 100 },
      { type: "bool", name: "safety_override" },
      { type: "text", name: "override_reason", max: 2000 },
      { type: "bool", name: "active" },
    ],
    indexes: ["CREATE INDEX idx_user_stacks_user ON user_stacks (user)"],
  }))

  // --- calendar_feeds: tokenized ICS subscriptions ---
  app.save(new Collection({
    type: "base",
    name: "calendar_feeds",
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: null,
    updateRule: "user = @request.auth.id",
    deleteRule: "user = @request.auth.id",
    fields: [
      { type: "relation", name: "user", collectionId: usersId, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "text", name: "name", required: true, max: 120 },
      { type: "text", name: "token", required: true, min: 32, max: 64 },
      { type: "select", name: "zone", values: ["morning", "pre_workout", "night", "all"], maxSelect: 1 },
      { type: "bool", name: "active" },
      { type: "date", name: "last_accessed" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_calendar_feeds_token ON calendar_feeds (token)",
      "CREATE INDEX idx_calendar_feeds_user ON calendar_feeds (user)",
    ],
  }))
}, (app) => {
  for (const name of ["calendar_feeds", "user_stacks", "substance_interactions", "substances", "user_profiles", "user_secrets"]) {
    app.delete(app.findCollectionByNameOrId(name))
  }
  const users = app.findCollectionByNameOrId("users")
  users.removeIndex("idx_users_username")
  for (const field of ["username", "tier", "recovery_verified"]) users.fields.removeByName(field)
  users.fields.getByName("email").required = true
  users.passwordAuth.identityFields = []
  users.listRule = null
  users.viewRule = null
  app.save(users)
})
