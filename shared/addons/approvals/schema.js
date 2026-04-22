import onetype from '@onetype/framework';

onetype.DataSchema('approval', {
	id: ['string'],
	team_id: ['string'],
	server_id: ['string'],
	script_id: ['string', null, true],
	user_id: ['string'],
	hash: ['string', null, true],
	is_approved: ['boolean', false],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
