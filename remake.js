import {
	getPackItem,
	powerPackName
} from "./editpowers.js";

export async function remakeCharacter() {
	// Create a new SWADE character

	new foundry.applications.api.DialogV2({
		window: {
			title: "Remake SWADE Character"
		},
		content: `
			<div class="form-group" width="400px">
			  <label>UUID:</label>
			  <input type="text" id="uuid" value="">
			</div>
			`,
		buttons: [
			{
				action: "ok",
				label: "OK",
				callback: async (event, button, dialog) => {
					 let uuid = button.form.elements.uuid.value;
					if (!uuid) return;
					await remake(uuid);
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, button, dialog) => null
			}
		]
	}).render(true);

	async function remake(uuid) {
		const oldActor = await fromUuid(uuid);
		if (!oldActor)
			return ui.notifications.notify(`Can't find ${uuid}`);

		const newActor = await Actor.create({
		  name: oldActor.name + ' (Copy)',
		  type: oldActor.type
		});

		newActor.sheet.render(true);
		await newActor.update({
			"system": oldActor.system,
			"img": oldActor.img,
			"prototypeToken": oldActor.prototypeToken
		});
		if (oldActor.system.wildcard)
			await newActor.update({"prototypeToken.actorLink": true});
		await newActor.update({
			"system.details.autoCalcToughness": true,
			"system.details.autoCalcParry": true
		});

		let addItems = [];

		for (let item of oldActor.items) {
			switch (item.type) {
			case 'power':
				let power = await getPackItem(powerPackName, item.system.swid);
				if (!power) {
					ui.notifications.warn(`Can't find ${item.system.swid} in compendium`);
					let np = {
						type: 'power',
						name: item.name,
						system: { trapping: item.system.trapping}
					};
					addItems.push(np);
				} else {
					const p = power.toObject();
					delete p._id;
					p.system.trapping = item.system.trapping;
					addItems.push(p);
				}
				break;
			default:
				const itemData = item.toObject();
				delete itemData._id;
				addItems.push(itemData);
				break;
			}
		}
		
		newActor.createEmbeddedDocuments("Item", addItems);
	}
}
