/**
 * Adds a schema JSON to head
 * @param {Object} schema
 */
export default function addSchema(schema) {
    const script = <script type="application/ld+json"/>
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}
