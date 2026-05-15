## ============================================================
## Integración con The Uncrowned Web — snippets para Godot
## ============================================================
##
## PASO 1: Crear autoload PlayerProfile
## Archivo: systems/player_profile.gd
## Agregar a Project > Project Settings > Autoload con nombre "PlayerProfile"

extends Node

const SAVE_PATH := "user://player_profile.cfg"
const API_URL := "https://the-uncrowned-web.vercel.app/api/runs"

var uuid: String = ""
var username: String = ""

var _http: HTTPRequest


func _ready() -> void:
	_load_or_create()


func _load_or_create() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) == OK:
		uuid = cfg.get_value("profile", "uuid", "")
		username = cfg.get_value("profile", "username", "")

	if uuid == "":
		# Generar UUID v4 simple
		randomize()
		uuid = "%08x-%04x-4%03x-%04x-%012x" % [
			randi() & 0xFFFFFFFF,
			randi() & 0xFFFF,
			randi() & 0x0FFF,
			(randi() & 0x3FFF) | 0x8000,
			(randi() & 0xFFFFFFFFFFFF),
		]
		_save()


func set_username(new_name: String) -> void:
	username = new_name.strip_edges().left(30)
	_save()


func has_username() -> bool:
	return username.length() >= 1


func _save() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("profile", "uuid", uuid)
	cfg.set_value("profile", "username", username)
	cfg.save(SAVE_PATH)


func submit_run(run_data: Dictionary) -> void:
	if not has_username():
		return  # No enviar si no tiene nombre

	if _http != null:
		_http.queue_free()

	_http = HTTPRequest.new()
	add_child(_http)
	_http.request_completed.connect(_on_submit_completed)

	var body := JSON.stringify(run_data)
	var headers := ["Content-Type: application/json"]
	_http.request(API_URL, headers, HTTPClient.METHOD_POST, body)


func _on_submit_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if result != HTTPRequest.RESULT_SUCCESS or response_code != 200:
		push_warning("[PlayerProfile] submit_run falló: result=%d code=%d" % [result, response_code])
		return
	var parsed := JSON.parse_string(body.get_string_from_utf8())
	if parsed and parsed.get("ok"):
		print("[PlayerProfile] Run enviada. Score: %d | Rank: #%d" % [parsed.get("score", 0), parsed.get("rank", 0)])


## ============================================================
## PASO 2: Modificar run_stats.gd — agregar al final de end_run_and_freeze()
##
## Al final del método end_run_and_freeze(), después de `run_active = false`, agregar:
##
##   _submit_run_to_api()
##
## Y agregar este método a run_stats.gd:

func _submit_run_to_api() -> void:
	var profile := get_node_or_null("/root/PlayerProfile")
	if profile == null or not profile.has_username():
		return

	var damage_dict: Dictionary = {}
	for source_id in _damage_totals:
		damage_dict[String(source_id)] = _damage_totals[source_id]

	var run_data := {
		"player_uuid": profile.uuid,
		"username": profile.username,
		"kills": kills_total,
		"elapsed_sec": snapshot_sec,
		"total_damage": _damage_totals.values().reduce(func(a, b): return a + b, 0),
		"damage_by_source": damage_dict,
		"weapon_id": selected_weapon_id,
		"enchantment": final_enchantment_overview if final_enchantment_overview != "Sin encantamiento" else null,
		"player_level": final_player_level,
		"character_id": selected_character_id,
	}

	profile.submit_run(run_data)


## ============================================================
## PASO 3: Pedir username la primera vez
##
## En main_menu.gd, al iniciar el menú agregar en _ready():
##
##   if not PlayerProfile.has_username():
##       _show_username_dialog()
##
## Y agregar el método:

func _show_username_dialog() -> void:
	# Mostrar un AcceptDialog o input personalizado pidiendo el nombre
	# Ejemplo mínimo con AcceptDialog + LineEdit:
	var dialog := AcceptDialog.new()
	dialog.title = "THE UNCROWNED"
	dialog.dialog_text = ""

	var vbox := VBoxContainer.new()
	var label := Label.new()
	label.text = "Elige tu nombre para el leaderboard:"
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

	var input := LineEdit.new()
	input.placeholder_text = "Tu nombre (3-20 chars)"
	input.max_length = 20
	input.custom_minimum_size = Vector2(280, 40)

	vbox.add_child(label)
	vbox.add_child(input)
	dialog.add_child(vbox)
	add_child(dialog)
	dialog.popup_centered()

	dialog.confirmed.connect(func():
		var name_val := input.text.strip_edges()
		if name_val.length() >= 3:
			PlayerProfile.set_username(name_val)
		dialog.queue_free()
	)
