import { App, TFile } from 'obsidian';
import { FrontmatterProperty } from '../types'

const matter = require("gray-matter")

export class FrontmatterParser {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    async parseFrontmatterFromTemplate(templatePath: string): Promise<FrontmatterProperty[]> {
        const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
        if (!templateFile || !(templateFile instanceof TFile)) {
            return [];
        }

        return this.extractFrontmatterProperties(await this.app.vault.read(templateFile))
    }

    private extractFrontmatterProperties(content: string): FrontmatterProperty[] {
        const parsedContent = matter(content)
        const properties: FrontmatterProperty[] = [];

        for (const [key, value] of Object.entries(parsedContent.data)) {
            properties.push({
                key: key,
                defaultValue: String(value),
                enabled: true
            })
        }

        return properties
    }
}