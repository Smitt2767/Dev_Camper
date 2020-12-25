const advancedResults = (Model, populate) => async (req, res, next) => {
  let query;

  // copy req.query Object
  const reqQuery = { ...req.query };

  // remove fields form reqQuery
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);

  // convert reqQuery Object into json (STRING)
  let queryStr = JSON.stringify(reqQuery);

  // replace gt || lt || gte || lte || in with ${value}
  queryStr = queryStr.replace(
    /\b(gt|lt|gte|lte|in)\b/g,
    (match) => `$${match}`
  );
  // find bootcamps using new json parse queryStr (OBJECT)
  query = Model.find(JSON.parse(queryStr));

  // Select perticular fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  // sortBy
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("createdAt");
  }
  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const startIndex = (page - 1) * limit; // 2 - 1 * 1 = 1
  const endIndex = page * limit; // 2 * 1 = 2
  const total = await Model.countDocuments();

  query = query.skip(startIndex).limit(limit);
  if (populate) {
    query = query.populate(populate);
  }
  const pagination = {};
  if (endIndex < total) {
    // 2 < 4 -> true
    pagination.next = {
      page: page + 1, // 3
      limit, // 1
    };
  }
  if (startIndex > 0) {
    // 1 > 0 -> true
    pagination.previous = {
      page: page - 1, // 1
      limit, // 1
    };
  }
  const docs = await query;
  res.advancedResults = {
    success: true,
    counts: docs.length,
    pagination,
    data: docs,
  };
  next();
};
module.exports = advancedResults;
