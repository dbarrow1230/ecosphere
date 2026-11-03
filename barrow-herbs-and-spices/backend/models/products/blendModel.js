import mongoose from 'mongoose';
export default function createBlendModel(connection) {
  const schema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      default: ''
    },
    description: String,
    category: String,
    heat: String,
    uses: String,
    storage: String,
    allergens: String,
    image: String,
    packGrams: {
      type: Number,
      required: true,
      min: 1
    },
    packagingCost: {
      type: Number,
      min: 0,
      default: 0
    },
    price: {
      type: Number,
      min: 0,
      required: true
    },
    published: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    formula: [{
      _id: false,
      kind: {
        type: String,
        enum: ['herbs', 'spices'],
        required: true
      },
      ingredientId: {
        type: String,
        required: true
      },
      percent: {
        type: Number,
        min: .001,
        max: 100,
        required: true
      }
    }]
  }, {
    collection: 'blends',
    timestamps: true,
    strict: false
  });
  schema.index({
    sku: 1
  }, {
    unique: true,
    partialFilterExpression: {
      sku: {
        $type: 'string',
        $gt: ''
      }
    }
  });
  return connection.models.Blend || connection.model('Blend', schema);
}
