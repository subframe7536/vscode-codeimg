import { displayName, name, publisher } from '../package.json'

export const EXTENSION_NAME = displayName
export const EXTENSION_NAME_LOWER = name
export const EXTENSION_SETTING_NAME = `${publisher}.${name}`
