import PocketBase from 'pocketbase'
import { env } from '$env/dynamic/public'

export const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:2017')
pb.autoCancellation(false)
