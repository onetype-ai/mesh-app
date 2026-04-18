import auth from '#auth/addon.js';

/* Client */
import '#auth/items/clients/auth.js';

/* Commands */
import '#auth/items/commands/me.js';
import '#auth/items/commands/login.js';
import '#auth/items/commands/register.js';
import '#auth/items/commands/user.js';
import '#auth/items/commands/logout.js';

/* Events */
import '#auth/events/http.js';

export default auth;
