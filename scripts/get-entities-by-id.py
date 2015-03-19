#!/usr/bin/python
import sqlite3
import json
import sys

# Get the list of entities.
id_list = sys.argv[1]
#id_list = "'" + id_list.replace(",", "','") + "'"

db = sqlite3.connect('../data.db')
c = db.cursor()

# Grab entities in list.
entities = {}
c.execute('SELECT * FROM entities WHERE entity_id in (%s)' % id_list)
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

# Get reaction ids that entities are part of.
reactions = {}
c.execute('SELECT DISTINCT reaction_id FROM reaction_entities WHERE entity_id IN (%s)' % id_list)
for (reaction_id,) in c:
  reaction_id = int(reaction_id)
  if reaction_id not in reactions:
    reactions[reaction_id] = {'id': reaction_id, 'entities': {}, 'pathways': {}}
reaction_list = ','.join([str(reaction['id']) for reaction in reactions.values()])

# Grab all entities that are part of the reactions.
c.execute('SELECT e.entity_id, e.type, e.name, e.location, e.uniprot_id, re.reaction_id, re.direction ' +
          'FROM entities AS e INNER JOIN reaction_entities AS re ' +
          'ON e.entity_id=re.entity_id ' +
          ('WHERE re.reaction_id IN (%s)' % reaction_list))
for (entity_id, _type, name, location, uniprot_id, reaction_id, direction) in c:
  entity_id = int(entity_id)
  reactions[int(reaction_id)]['entities'][entity_id] = direction
  if entity_id not in entities:
    entities[int(entity_id)] = {
      'id': entity_id,
      'reactome_id': entity_id,
      'type': _type,
      'name': name,
      'expression': 'none',
      'location': location,
      'uniprot_id': uniprot_id,
      'pathways': {}}

# Grab full reaction data.
#c.execute('SELECT * FROM reactions WHERE reaction_id IN (%s)' % reaction_list)
#for (reaction_id, name, pathway_id, local_id) in c:
#  reaction = reactions[reaction_id]
#  reaction['name'] = name
#  reaction['pathways']['pathway_id'] = local_id



pathways = {}
c.execute('SELECT * FROM entity_pathways WHERE entity_id IN (%s)' % id_list)
for (entity_id, pathway_id, local_id) in c:
  entity_id = int(entity_id)
  entities[entity_id]['pathways'][int(pathway_id)] = local_id
  if pathway_id not in pathways:
    pathways[pathway_id] = {
      'id': pathway_id,
      'entities': {entity_id: local_id}}

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
