// Preserve the cursor-shaped service interface while all records use registered Mongoose models.
export function createRecordRepository(models) {
  return {
    collection(name) {
      const Model = models[name];
      if (!Model) throw Error('Unknown record collection.');
      return {
        find(query) {
          let cursor = Model.find(query);
          return {
            sort(order) {
              cursor = cursor.sort(order);
              return this;
            },
            limit(count) {
              cursor = cursor.limit(count);
              return this;
            },
            toArray() {
              return cursor.lean().exec();
            }
          };
        },
        findOne(query) {
          return Model.findOne(query).lean().exec();
        },
        async insertOne(row) {
          const saved = await Model.create(row);
          return {
            insertedId: saved._id
          };
        },
        updateOne(query, update, options = {}) {
          return Model.updateOne(query, update, {
            ...options,
            runValidators: true
          }).exec();
        },
        findOneAndUpdate(query, update, options = {}) {
          return Model.findOneAndUpdate(query, update, {
            ...options,
            new: options.returnDocument === 'after',
            runValidators: true
          }).lean().exec();
        }
      };
    }
  };
}
