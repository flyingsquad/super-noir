
export async function knockback() {

	async function applyKnockback(damage, collision) {
		const dt = [10, 20, 30, 40, 50];
		let noKnockback = "";
		let knockbacks = "";

		for (const token of targets) {
			const index = Math.floor((token.actor.system.stats.size + 4) / 4);

			if (index < 0) index = 0;
			else if (index >= dt.length) index = dt.length - 1;
			const n = dt[index];
			if (damage >= n) {
				const C = damage - n, g = 1 + Math.floor(C / 10), b = Roll.create(`${g}d6`);
				await b.evaluate();
				const w = b.total;
				
				let u = `<strong>${token.name}</strong> knocked back ${w}" (${g}d6)`;
				if (collision) {
					u += `Applying collision damage: 2d6 + ${w}<br>`;
					try {
						await new CONFIG.Dice.DamageRoll(`2d6 + ${w}`).toMessage({
						  speaker: ChatMessage.getSpeaker({ token: token }),
						  flavor: `Collision Damage from Knockback (${w} inches)`
						});
					} catch (E) {
						console.error("Error rolling collision damage:", E), ui.notifications.error("Failed to roll collision damage.");
					}
				}					
				if (knockbacks)
					knockbacks += "<br>";
				knockbacks += u;
			} else {
				if (noKnockback)
					noKnockback += ", ";
				noKnockback += token.name;
			}
		}
		if (knockbacks)
			knockbacks = `<p><b>Knockback!</b></p><p>` + knockbacks + `<br>Reminder: roll Athletics at −2 or fall Prone.</p>`;
		if (noKnockback)
			knockbacks += `<p>No knockback: ${noKnockback}</p>`;
		
		if (knockbacks) {
			await ChatMessage.create({
				content: knockbacks
			});
		}			
	}
	
	const targets = Array.from(game.user.targets);
	if (targets.length == 0)
		return ui.notifications.notify("Target one or more tokens.");
	
	const content = `<p>Enter damage for Knockback.</p>
		<div style="display: table; width: 300px;">
			<div style="display: table-row-group">
				<div style="display: table-row;">
					<div style="display: table-cell">
						<label for="damage">Damage</label>
					</div>
					<div style="display: table-cell">
						<input type="number" id="damage" name="damage" maxlength="2" size="2">
					</div>
				</div>
				<div style="display: table-row;">
					<div style="display: table-cell">
						<label for="collision">Collision?</label>
					</div>
					<div style="display: table-cell">
						<input type="checkbox" id="collision" name="collision">
					</div>
				</div>
			</div>
		</div>`;

	const dlg = new foundry.applications.api.DialogV2({
		window: { title: "Knockback Calculator" },
		content: content,
		buttons: [
			{
				label: "Apply Knockback",
				action: "ok",
				default: true,
				callback: async (event, button, dialog) => {
					applyKnockback(button.form.elements.damage.valueAsNumber,
						button.form.elements.collision.checked);
					return true;
				}
			},
			{
				action: "cancel",
				label: "Cancel",
				callback: (event, buton, dialog) => { return false; }
			}
		]
	}).render(true);
}


async function Q(m) {
  const t = Array.from(game.user.targets);
  if (!m)
    return ui.notifications.warn("Select a token to determine knockback direction.");
  if (!t.length)
    return ui.notifications.warn("You must target at least one actor.");
  const e = [
    { value: 10, label: "Small or Tiny" },
    { value: 20, label: "Normal" },
    { value: 30, label: "Large" },
    { value: 40, label: "Huge" },
    { value: 50, label: "Gargantuan" }
  ], { createCheckboxInput: o, createFormGroup: i, createSelectInput: a, createNumberInput: r } = foundry.applications.fields, c = document.createElement("div"), s = i({
    label: "Damage Dealt",
    input: r({ name: "damage", value: 30 })
  }), l = i({
    label: "Target Scale",
    input: a({
      name: "threshold",
      options: e,
      value: 10,
      dataset: { dtype: "Number" }
    })
  }), f = i({
    label: "Hit Obstacle?",
    input: o({ name: "obstacle" })
  });
  c.append(s, l, f);
  const { damage: d, threshold: n, obstacle: p } = await foundry.applications.api.DialogV2.input({
    window: { title: "Knockback Calculator" },
    content: c,
    ok: {
      label: "Apply Knockback",
      icon: "fa-solid fa-person-running"
    }
  });
  if (d < n)
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: m }),
      content: `Not enough damage to trigger knockback (Threshold: ${n}).`
    });
  let u = "<strong>Knockback Results</strong><br>";
  u += `Damage: ${d} vs Threshold for ${e.find((h) => h.value === n).label} (${n})<br><br>`;
  const y = [];
  for (const h of t) {
    const C = d - n, g = 1 + Math.floor(C / 10), b = Roll.create(`${g}d6`);
    await b.evaluate();
    const w = b.total;
    if (y.push(b), u += `<strong>${h.name}</strong> is knocked back ${w}" (${g}d6)<br>`, p) {
      u += `Applying collision damage: 2d6 + ${w}<br>`;
      try {
        await new CONFIG.Dice.DamageRoll(`2d6 + ${w}`).toMessage({
          speaker: ChatMessage.getSpeaker({ actor: h.actor }),
          flavor: `Collision Damage from Knockback (${w} inches)`
        });
      } catch (E) {
        console.error("Error rolling collision damage:", E), ui.notifications.error("Failed to roll collision damage.");
      }
    }
    u += `Reminder: ${h.name} must roll Athletics at −2 or fall Prone.<br><br>`;
  }
  await ChatMessage.create({
    rolls: y,
    speaker: ChatMessage.getSpeaker({ actor: m }),
    content: u
  });
}
