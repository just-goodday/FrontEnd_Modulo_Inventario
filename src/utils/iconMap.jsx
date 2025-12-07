import * as Icons from "lucide-react";

export const iconMap = new Proxy(Icons, {
    get: (target, prop) => target[prop] || null
});
