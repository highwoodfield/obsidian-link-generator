/** @format */

import { link } from 'fs';
import {App, MarkdownView, Modal, Notice, Plugin, Setting, TFile, Vault} from 'obsidian'

interface LinkGeneratorSettings {
}

const DEFAULT_SETTINGS: LinkGeneratorSettings = {}

export default class LinkGeneratorPlugin extends Plugin {
    settings: LinkGeneratorSettings

    async onload() {
        // await this.loadSettings();

		this.addCommand({
			id: "link-generator-generate",
			name: "Generate a link to the opened note",

			checkCallback: (checking: boolean) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (activeView == null) return false;
				const file = activeView.file
				if (file == null) return false;
				if (checking) return true;

				new GeneratorModal(this.app, file).open();
			}
		});
    }

    onunload() {
        console.log('unloading plugin')
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }
}

class GeneratorModal extends Modal {
	target_file: TFile;
	disp_name: string;

	constructor(app: App, target_file: TFile) {
		super(app);
		this.target_file = target_file;
		this.disp_name = target_file.basename;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("p", {}, el => {
			el.textContent = "Page: " + this.target_file.basename;
		});
		new Setting(contentEl)
			.setName("Display Name")
			.setDesc("The display name of the link")
			.addTextArea(text => text
				.setPlaceholder(this.disp_name)
				.onChange(v => this.disp_name = v)
			);
		contentEl.createEl("button", { text: "Generate" }, el => {
			el.addEventListener("click", () => {
				this.close();
				new LinkDisplayModal(this.app, `[${this.disp_name}](${encodeURI(this.target_file.path)})`).open();
			});
		})
	}
}

class LinkDisplayModal extends Modal {
	link_text: string;

	constructor(app: App, link_text: string) {
		super(app);
		this.link_text = link_text;
	}

	onOpen(): void {
		const contentEl = this.contentEl;
		contentEl.createEl("textarea", { text: this.link_text });

		contentEl.createEl("button", { text: "OK" }, el => {
			el.addEventListener("click", async () => {
				this.close();
			});
		})
	}
}
