import agents from './addon.js';

import './core/schemas/dynamic.js';
import './core/schemas/static.js';

import './item/catch/removed.js';
import './core/pipelines/connect.js';
import './core/pipelines/disconnect.js';
import './core/pipelines/bash.js';
import './core/pipelines/metrics/dynamic.js';
import './core/pipelines/metrics/static.js';
import './items/servers/grpc.js';

export default agents;
