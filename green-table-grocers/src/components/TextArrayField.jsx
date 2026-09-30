import {Button, Form} from "react-bootstrap";

export default function TextArrayField({
  label,
  name,
  values = [],
  placeholder = "",
  onChange,
  addLabel = "Add",
  removeLabel = "Remove",
  rows = 2,
  minItems = 1,
  className = "",
}) {
  const minimumItems = Math.max(0, minItems);
  const items = values.length ? values : Array.from({length: minimumItems}, () => "");

  const commit = (nextItems) => {
    const paddedItems = [...nextItems];
    while (paddedItems.length < minimumItems) paddedItems.push("");
    onChange(name, paddedItems);
  };

  const updateItem = (index, value) =>
    commit(items.map((item, itemIndex) => (itemIndex === index ? value : item)));

  const addItem = () => commit([...items, ""]);
  const removeItem = (index) => commit(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <Form.Group className={`zettel-field zettel-field-full zettel-list-field ${className}`.trim()}>
      <Form.Label>{label}</Form.Label>
      <div className="form-field-content">
        {items.map((value, index) => (
          <div className="d-flex align-items-start gap-2 mb-2" key={`${name}-${index}`}>
            <Form.Control
              as="textarea"
              rows={rows}
              value={value}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
            />
            <Button
              type="button"
              size="sm"
              variant="outline-danger"
              onClick={() => removeItem(index)}
              disabled={items.length <= minimumItems && !value}
            >
              {removeLabel}
            </Button>
            {index === items.length - 1 && (
              <Button type="button" size="sm" variant="outline-primary" onClick={addItem}>
                {addLabel}
              </Button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <Button type="button" size="sm" variant="outline-primary" onClick={addItem}>
            {addLabel}
          </Button>
        )}
      </div>
    </Form.Group>
  );
}
