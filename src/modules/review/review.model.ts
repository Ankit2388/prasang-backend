import { Schema, model } from 'mongoose';
import { IReviewDocument } from './review.interface.js';

const reviewSchema = new Schema<IReviewDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required for a review'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a review'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'FLAGGED', 'HIDDEN'],
      default: 'PUBLISHED',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const retObj = ret as Record<string, unknown>;
        retObj.id = retObj._id;
        delete retObj._id;
        delete retObj.__v;
        return retObj;
      },
    },
  },
);

// One review per user per business
reviewSchema.index({ businessId: 1, userId: 1 }, { unique: true });

export const ReviewModel = model<IReviewDocument>('Review', reviewSchema);
