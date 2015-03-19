#!/usr/bin/python
import sqlite3
import json
import sys

# Grab all related info for a specific entity.

symbol_list = sys.argv[1]
symbol_list = "'" + symbol_list.replace(",", "','") + "'"

db = sqlite3.connect('../data.db')
c = db.cursor()

entities = {}
c.execute('SELECT * FROM entities WHERE name IN (%s)' % symbol_list)
for (entity_id, _type, name, location, uniprot_id) in c:
  entities[int(entity_id)] = {
    'id': entity_id,
    'reactome_id': entity_id,
    'type': _type,
    'name': name,
    'expression': 'none',
    'location': location,
    'uniprot_id': uniprot_id,
    'pathways': {}}

if 0 == len(entities.values()):
  print('{\'error\': \'symbols unknown\'}')
  sys.exit()

sql_entity_ids = []
for entity_id in entities:
  sql_entity_ids.append(str(entity_id))
sql_entity_ids = ", ".join(sql_entity_ids)

pathways = {}
c.execute('SELECT * FROM entity_pathways WHERE entity_id IN (%s)' % sql_entity_ids)
for (entity_id, pathway_id, local_id) in c:
  entity_id = int(entity_id)
  entities[entity_id]['pathways'][int(pathway_id)] = local_id
  if pathway_id not in pathways:
    pathways[pathway_id] = {
      'id': pathway_id,
      'entities': {entity_id: local_id}}

reactions = {}
entities = {} # clear entity list
c.execute('SELECT DISTINCT reaction_id FROM reaction_entities WHERE entity_id IN (%s)' % sql_entity_ids)
for (reaction_id,) in c:
  reaction_id = int(reaction_id)
  if reaction_id not in reactions:
    reactions[reaction_id] = {'id': reaction_id}

for reaction_id in reactions:
  reaction = reactions[reaction_id]
  c.execute('SELECT * FROM reactions WHERE reaction_id=?', (reaction_id,))
  for (reaction_id, name, pathway_id, local_id) in c:
    reaction['name'] = name
    reaction['pathways'] = {pathway_id: local_id}
    reaction['entities'] = {}
  c.execute('SELECT * FROM reaction_entities WHERE reaction_id=?', (reaction_id,))
  for (reaction_id, entity_id, direction) in c:
    entity_id = int(entity_id)
    reaction['entities'][entity_id] = direction
    if entity_id not in entities:
      entities[entity_id] = {'id': entity_id, 'reactome_id': entity_id}

for entity_id in entities:
  entity = entities[entity_id]
  c.execute('SELECT * FROM entities WHERE entity_id=?', (entity_id,))
  for (entity_id, _type, name, location, uniprot_id) in c:
    entity['type'] = _type
    entity['name'] = name
    entity['expression'] = 'none'
    entity['location'] = location
    entity['uniprot_id'] = uniprot_id
    entity['pathways'] = {}
  c.execute('SELECT * FROM entity_pathways WHERE entity_id=?', (entity_id,))
  for (entity_id, pathway_id, local_id) in c:
    entity['pathways'][int(pathway_id)] = local_id
    if pathway_id not in pathways:
      pathways[pathway_id] = {
        'id': pathway_id,
        'entities': {entity_id: local_id}}
    else:
      pathways[pathway_id]['entities'][entity_id] = local_id

pathways_f = open('../pathways', 'r')
for line in pathways_f:
  parts = line.strip().split('|')
  parts[0] = int(parts[0])
  if parts[0] in pathways:
    pathway = pathways[parts[0]]
    pathway['name'] = parts[1]
    pathway['species'] = parts[2]

print(json.dumps({
  'entities': entities,
  'reactions': reactions,
  'pathways': pathways}))
