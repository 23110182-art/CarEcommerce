const Car = require('./car.model');

class CarRepository {
  async create(data) {
    return await Car.create(data);
  }

  async findByIdOrSlug(idOrSlug) {
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    return await Car.findOne(query).populate('brand', 'name slug logo').populate('category', 'name slug');
  }

  async updateById(id, data) {
    const car = await Car.findById(id);
    if (!car) return null;
    
    Object.assign(car, data);
    return await car.save();
  }

  async deleteById(id) {
    return await Car.findByIdAndDelete(id);
  }

  async findSimilar(carId) {
    const car = await Car.findById(carId);
    if (!car) return [];
    return await Car.find({
      category: car.category,
      _id: { $ne: carId },
    }).limit(4).populate('brand', 'name slug').populate('category', 'name slug');
  }

  async getStats(carId) {
    const Order = require('../order/order.model');
    const Review = require('../review/review.model');

    const buyersCount = await Order.countDocuments({
      'items.car': carId,
      status: 'completed', // Assuming 'completed' means purchased successfully
    });

    const reviewersCount = await Review.countDocuments({
      product: carId,
    });

    return {
      buyersCount,
      reviewersCount,
    };
  }

  // Phức tạp nhất: Query, Filter, Pagination, Sort
  async findAllWithFilters(query) {
    const queryObj = { ...query };
    
    // 1. Filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Lọc theo khoảng giá (minPrice, maxPrice) -> MongoDB {$gte, $lte}
    if (queryObj.minPrice || queryObj.maxPrice) {
      queryObj.price = {};
      if (queryObj.minPrice) {
        queryObj.price.$gte = Number(queryObj.minPrice);
        delete queryObj.minPrice;
      }
      if (queryObj.maxPrice) {
        queryObj.price.$lte = Number(queryObj.maxPrice);
        delete queryObj.maxPrice;
      }
    }

    // Lọc theo text search (tên xe)
    if (query.search) {
      queryObj.name = { $regex: query.search, $options: 'i' };
    }

    // Map query string fields to DB fields
    
    
    // Dynamic filters based on virtuals requirements
    if (queryObj.is_new === true || queryObj.is_new === 'true') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      queryObj.createdAt = { $gte: sixMonthsAgo };
      delete queryObj.is_new;
    }

    let dbQuery = Car.find(queryObj).populate('brand', 'name slug').populate('category', 'name slug');

    // 2. Sorting
    if (query.sort) {
      // transform 'price_desc' to '-price'
      let sortBy = query.sort;
      if (sortBy === 'price_desc') sortBy = '-price';
      else if (sortBy === 'price_asc') sortBy = 'price';
      else if (sortBy === 'newest') sortBy = '-createdAt';
      else if (sortBy === 'best_selling') sortBy = '-sold_count';
      
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort('-createdAt'); // default sort
    }

    // 3. Pagination
    const page = query.page * 1 || 1;
    const limit = query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    dbQuery = dbQuery.skip(skip).limit(limit);

    // Get total count for pagination metadata
    const totalCount = await Car.countDocuments(queryObj);

    const cars = await dbQuery;

    return {
      cars,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }
}

module.exports = new CarRepository();
