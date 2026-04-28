import agents from './addon.js';

import './core/register/emits.js';
import './core/register/middlewares.js';

import './core/register/schemas/dynamic.js';
import './core/register/schemas/static.js';

import './item/catch/removed.js';
import './core/pipelines/connect.js';
import './core/pipelines/disconnect.js';
import './core/pipelines/bash.js';
import './core/pipelines/approve.js';
import './core/pipelines/revoke.js';
import './core/pipelines/cancel.js';
import './core/pipelines/proxy/open.js';
import './core/pipelines/proxy/data.js';
import './core/pipelines/proxy/close.js';
import './core/pipelines/metrics/dynamic.js';
import './core/pipelines/metrics/static.js';

import './core/events/middlewares/connect.js';
import './core/events/emits/disconnect.js';

import './items/commands/bash.js';
import './items/commands/approve.js';
import './items/commands/revoke.js';
import './items/commands/cancel.js';

import './items/servers/grpc.js';

export default agents;
