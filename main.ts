import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface CalendarSettings {
	birth?: string | number
	average?: string | number
	color?: string
}


const DEFAULT_SETTINGS: CalendarSettings = {
	birth: 2002,
	average: 72,
	color: "#FFD700",
}


export default class LifeCalendarPlugin extends Plugin {
	settings: CalendarSettings;

	async onload() {
		await this.loadSettings();


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		//@ts-ignore
		window.renderLifeCalendar = (el:HTMLElement, calendarSettings?: CalendarSettings): void => {

			const birthYear: number = Number(calendarSettings?.birth || this.settings.birth);
			const averageAge: number = Number(calendarSettings?.average || this.settings.average);

			const lifeCalendarGraphDiv = createDiv({
				cls: "life-calendar-graph",
				parent: el,
			})

			const lifeCalendarMonthsUl = createEl("ul", {
				cls: "life-calendar-months",
				parent: lifeCalendarGraphDiv,
			})

			createEl("li", { text: "Jan", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Feb", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Mar", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Apr", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "May", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Jun", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Jul", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Aug", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Sep", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Oct", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Nov", parent: lifeCalendarMonthsUl, })
			createEl("li", { text: "Dec", parent: lifeCalendarMonthsUl, })

			// Assume it is year
			const lifeCalendarDaysUl = createEl("ul", {
				cls: "life-calendar-days",
				parent: lifeCalendarGraphDiv,
			})
			
			for (let year = birthYear; year <= birthYear + averageAge; year++){
				createEl("li", {text: year.toString(), parent: lifeCalendarDaysUl, })
			}


			const lifeCalendarBoxesUl = createEl("ul", {
				cls: "life-calendar-boxes",
				parent: lifeCalendarGraphDiv,
			})

			interface Box {
				month?: number;
				year?: number;
				backgroundColor?: string;
				classNames?: string[];
			}

			const boxes: Array<Box> = []
			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().getMonth();

			for(let year = birthYear; year <= birthYear + averageAge; year++){
				for (let month = 0; month < 12; month ++){
					const box: Box = {
						classNames: [],
					}
					if (year < currentYear || (year == currentYear && month < currentMonth)) {
						box.classNames?.push("hasData")
						box.month = month;
						box.year = year;
						box.backgroundColor = this.settings.color;
					} else box.classNames?.push("isEmpty")

					boxes.push(box)
				}
			}

			boxes.forEach(e => {
				createEl("li", {
					attr: {
						style: `background-color: ${e.backgroundColor};`,
					},
					cls: e.classNames,
					parent: lifeCalendarBoxesUl,
				})

			})

		}




	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



class SampleSettingTab extends PluginSettingTab {
	plugin: LifeCalendarPlugin;

	constructor(app: App, plugin: LifeCalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	private displayHelp(parent: HTMLElement) {
		parent.createEl("p", {
			text: "You can change the default year, average age, and color of the heatmap.",
		})
	}

	private validateColorInput(value: string) {
		const colorRegex = /^(#[0-9a-f]{3,6}|rgba?\(\s*\d+%?\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*\d+(\.\d+)?%?)?\s*\))$/i;
		return colorRegex.test(value);
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl("h2", {text: "Life Calendar Settings"})
		
		const inputBirth = createEl("div", {parent:containerEl});
		new Setting(inputBirth)
			.setName('Birth Year')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your birth year')
				.setValue("2024")
				.onChange(async (value) => {
					this.plugin.settings.birth = value;
					await this.plugin.saveSettings();
				}));

		const inputAverageAge = createEl("div", {parent:containerEl});
		new Setting(inputBirth)
			.setName('Average Age')
			.setDesc('Live until 2077')
			.addText(text => text
				.setPlaceholder('Enter the RIP time')
				.setValue("2077")
				.onChange(async (value) => {
					this.plugin.settings.average = value;
					await this.plugin.saveSettings();
				}));
		
		const inputColor = createEl("div", {parent:containerEl})
		new Setting(inputColor)
			.setName('Favorite Color')
			.setDesc("Pick you favorite color for the heatmap")
			.addText(text => text
				.setPlaceholder('Enter valid css color')
				.setValue("#FFD700")
				.onChange(async (value) => {
					if (this.validateColorInput(value)) {
						this.plugin.settings.color = value;
						await this.plugin.saveSettings();
					} else {
						new Notice('Invalid color format. Please enter a valid CSS color.');
					}
				}));
	}
}
