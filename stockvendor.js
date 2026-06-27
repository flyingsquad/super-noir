

export async function stockVendor() {
	const token = canvas.tokens.controlled[0];
	if (!token)
		return ui.notifications.warn("No vendor token selected.");
	const actor = token.actor;
	if (!actor)
		return ui.notifications.warn("Token has no actor assigned.");
	if (actor.type != 'npc')
		return ui.notifications.warn("Vendor tokens must be NPCs.");
	
	new foundry.applications.api.DialogV2({
		window: {
			title: "Restock Vendor"
		},
		content: `
			<div class="form-group" width="300">
			  <label>Compendium:</label>
			  <input type="text" id="gearPack" value="super-noir.items">
			</div>
			`,
		buttons: [
			{
				action: "ok",
				label: "OK",
				callback: async (event, button, dialog) => {
					 let gearPack = button.form.elements.gearPack.value;
					if (!gearPack) return;
					await stock(gearPack);
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => null
			}
		]
	}).render(true);	
	
	
	async function stock(gearPack) {
		const pack = game.packs.get(gearPack);

		if (!pack)
			return ui.notifications.error(`Pack not found: ${gearPack}`);

		const index = await pack.getIndex();

		if (!index)
		  return ui.notications.error(`Unable to get compendium index for ${gearPack}`);
		let addItems = [];
		for (const entry of index) {
			const item = await fromUuid(entry.uuid);
			if (item.system.price > 0) {
				const itemData = item.toObject();
				addItems.push(itemData);
			}
		}
		actor.createEmbeddedDocuments("Item", addItems);
	}

}
