/* CUSTOMIZE
 * Add any extra themes here: just copy-paste the whole block, changing only the class
 * name for the theme's name that will appear in the drop-down, and the name in single
 * quotes (here, dark-slate-journal) with whatever name you gave your theme in the .css
 * file
 */
 
class SuperNoirJournal extends JournalSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('super-noir-journal');
		return options;
	}
}

Hooks.on("init", (documentTypes) => {

	Journal.registerSheet("journals", SuperNoirJournal, {
		label: "Super Noir",
		types: ["base"],
		makeDefault: false
	});

});