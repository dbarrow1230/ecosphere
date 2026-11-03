import mongoose from 'mongoose';
export default function createOrderModel(connection) {
  const schema = new mongoose.Schema({
    requestId: {
      type: String,
      required: true,
      unique: true
    },
    reference: {
      type: String,
      required: true
    },
    customer: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: String
    },
    items: [{
      _id: false,
      productId: String,
      name: String,
      quantity: {
        type: Number,
        min: 1
      },
      unitPrice: {
        type: Number,
        min: 0
      },
      packGrams: Number
    }],
    notes: String,
    subtotal: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    transition: {
      type: mongoose.Schema.Types.Mixed
    }
  }, {
    collection: 'orders',
    timestamps: true,
    strict: false
  });
  return connection.models.BlendOrder || connection.model('BlendOrder', schema);
}
