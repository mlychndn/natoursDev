class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1a. simple filter
    const excludedString = ['page', 'limit', 'sort', 'fields', 'order'];
    const modifiedQuery = { ...this.queryStr };

    excludedString.forEach((str) => delete modifiedQuery[str]);

    // 1b. advance filter
    let queryStr = JSON.stringify(modifiedQuery);
    queryStr = JSON.parse(
      queryStr
        .replace('lt', '$lt')
        .replace('lte', '$lte')
        .replace('gt', '$gt')
        .replace('gte', '$gte')
    );

    // queryStr = JSON.parse(
    //   queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    // );

    this.query.find(queryStr);
    return this;
  }

  sorting() {
    if (this.queryStr.sort) {
      const sortQuery = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortQuery);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  selection() {
    if (this.queryStr.fields) {
      const fieldQuery = this.queryStr.fields.split(',').join(' ');
      this.query.select(fieldQuery);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 3;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
