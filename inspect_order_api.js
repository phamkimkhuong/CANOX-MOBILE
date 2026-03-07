const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/EBAY/temp_swagger.json', 'utf8'));

function inspect(name) {
    const s = data.components.schemas[name];
    if (!s) return `${name} not found`;
    let res = `--- ${name} ---\n`;
    if (s.properties) {
        for (const [k, v] of Object.entries(s.properties)) {
            let type = v.type;
            if (v.$ref) type = `Ref(${v.$ref.split('/').pop()})`;
            if (v.items) {
                if (v.items.$ref) type = `Array[Ref(${v.items.$ref.split('/').pop()})]`;
                else type = `Array[${v.items.type}]`;
            }
            res += `${k}: ${type}${v.description ? ' - ' + v.description : ''}\n`;
        }
    }
    return res;
}

const out = [];
out.push(inspect('OrderItemData'));

fs.writeFileSync('c:/EBAY/order_schemas_item.txt', out.join('\n\n'), 'utf8');
