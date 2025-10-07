/**
 * Settings management for Daily Clone plugin
 */

import { DailyClonePluginSettings } from '../types';

export const DEFAULT_SETTINGS: DailyClonePluginSettings = {
	dailyNoteTemplate: '',
	dailyNoteFilenameFormat: 'YYYY-MM-DD',
	dailyNoteFolder: '/',
	dailyNoteFrontmatterProperties: {}
};

export { DailyCloneSettingTab } from './settingsTab';