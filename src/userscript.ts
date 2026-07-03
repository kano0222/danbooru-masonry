import { boot } from './main';
import { resolveAdapter } from './prepare';

const adapter = resolveAdapter(location);
if (adapter) boot(adapter);
