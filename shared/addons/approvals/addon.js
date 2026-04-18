import onetype from '@onetype/framework';

const approvals = onetype.Addon('approvals', (approvals) =>
{
	approvals.Field('id', ['string']);
	approvals.Field('team_id', ['string', null, true]);
	approvals.Field('server_id', ['string']);
	approvals.Field('script_id', ['string', null, true]);
	approvals.Field('user_id', ['string']);
	approvals.Field('hash', ['string', null, true]);
	approvals.Field('is_approved', ['boolean', false]);
	approvals.Field('updated_at', ['string']);
	approvals.Field('created_at', ['string']);
	approvals.Field('deleted_at', ['string']);
});

export default approvals;
