const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./shared/middleware/error.middleware');
const AppError = require('./shared/errors/AppError');

const app = express();

// Global Middlewares
app.use(helmet()); // Security HTTP headers
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
})); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Cookie parser
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Request logging
}

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const brandRoutes = require('./modules/brand/brand.routes');
const categoryRoutes = require('./modules/category/category.routes');
const bannerRoutes = require('./modules/banner/banner.routes');
const postRoutes = require('./modules/post/post.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const carRoutes = require('./modules/car/car.routes');
const promotionRoutes = require('./modules/promotion/promotion.routes');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/cars', carRoutes);
app.use('/api/v1/promotions', promotionRoutes);

// Handle unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
