/**
 * Core daily notes creation functionality
 */

import { App, Notice, TFile, moment } from 'obsidian';
import { DailyClonePluginSettings } from '../types';

export async function createDailyNotesBetweenDates(
	app: App, 
	startDateAsString: string, 
	endDateAsString: string, 
	settings: DailyClonePluginSettings
): Promise<void> {
	const startDate = new Date(startDateAsString);
	const endDate = new Date(endDateAsString);

	if (startDate > endDate) {
		new Notice("Invalid date range: start date must be before or equal to end date");
		return;
	}

	// Ensure folder exists
	const folder = settings.dailyNoteFolder || "/";
	if (folder !== "/" && !(await app.vault.adapter.exists(folder))) {
		try {
			await app.vault.createFolder(folder);
		} catch (error) {
			new Notice(`Failed to create folder: ${folder}`);
			return;
		}
	}

	// Load template content if specified
	let templateContent = "";
	if (settings.dailyNoteTemplate) {
		try {
			const templateFile = app.vault.getAbstractFileByPath(settings.dailyNoteTemplate);
			if (templateFile && templateFile instanceof TFile) {
				templateContent = await app.vault.read(templateFile);
			}
		} catch (error) {
			console.warn("Could not load template:", error);
		}
	}

	// Generate files for date range
	const currentDate = new Date(startDate);
	let createdCount = 0;
	let skippedCount = 0;

	while (currentDate <= endDate) {
		try {
			// Format filename using moment
			const filenameFormat = settings.dailyNoteFilenameFormat || "YYYY-MM-DD";
			const filename = moment(currentDate).format(filenameFormat);
			const filePath = folder === "/" ? `${filename}.md` : `${folder}/${filename}.md`;

			// Check if file already exists
			if (await app.vault.adapter.exists(filePath)) {
				skippedCount++;
			} else {
				// Determine content
				let content = templateContent;
				if (!content) {
					// Default content with date heading
					const dateString = moment(currentDate).format("YYYY-MM-DD");
					content = `# ${dateString}\n\n`;
				}

				// Create the file
				await app.vault.create(filePath, content);
				createdCount++;
			}
		} catch (error) {
			console.error("Error creating daily note:", error);
		}

		// Move to next day
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Provide user feedback
	let message = `Created ${createdCount} daily notes`;
	if (skippedCount > 0) {
		message += `, skipped ${skippedCount} existing files`;
	}
	new Notice(message);
}