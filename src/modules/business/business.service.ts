import { BusinessModel } from './business.model.js';
import {
  CreateBusinessDTO,
  UpdateBusinessDTO,
  BusinessQueryFilters,
  BusinessApprovalStatus,
  IBusinessDocument,
} from './business.interface.js';
import { VendorModel } from '../vendor/vendor.model.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';
import mongoose from 'mongoose';

export class BusinessService {
  public async createBusiness(data: CreateBusinessDTO): Promise<IBusinessDocument> {
    const vendor = await VendorModel.findById(data.vendorId);
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Vendor with ID ${data.vendorId} not found`);
    }

    const existingBusiness = await BusinessModel.findOne({ vendorId: data.vendorId });
    if (existingBusiness) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Vendor already has a registered business. A vendor can only register one business.',
      );
    }

    const business = new BusinessModel({
      vendorId: data.vendorId,
      businessName: data.businessName,
      description: data.description,
      cuisineTypes: data.cuisineTypes || [],
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      location: data.location,
      contactInformation: data.contactInformation,
      capacity: data.capacity,
      businessHours: data.businessHours || [],
      status: data.status || 'APPROVED',
      coverImage: data.coverImage,
      logo: data.logo,
    });

    return business.save();
  }

  public async getBusinessById(id: string): Promise<IBusinessDocument> {
    const business = await BusinessModel.findById(id)
      .populate('vendor')
      .populate({
        path: 'menus',
        populate: { path: 'items' },
      });

    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${id} not found`);
    }
    return business;
  }

  public async getBusinessByVendorId(vendorId: string): Promise<IBusinessDocument | null> {
    return BusinessModel.findOne({ vendorId }).populate({
      path: 'menus',
      populate: { path: 'items' },
    });
  }

  public async getBusinesses(filters: BusinessQueryFilters) {
    const {
      city,
      cuisine,
      search,
      minCapacity,
      maxCapacity,
      minRating,
      status = 'APPROVED',
      page = 1,
      limit = 10,
    } = filters;

    const query: Record<string, unknown> = { status };

    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    if (cuisine) {
      query.cuisineTypes = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { cuisineTypes: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (minCapacity !== undefined) {
      query['capacity.maxGuests'] = { $gte: Number(minCapacity) };
    }

    if (maxCapacity !== undefined) {
      query['capacity.minGuests'] = { $lte: Number(maxCapacity) };
    }

    if (minRating !== undefined) {
      query.averageRating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const [businesses, total] = await Promise.all([
      BusinessModel.find(query)
        .sort({ averageRating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      BusinessModel.countDocuments(query),
    ]);

    return {
      businesses,
      pagination: {
        total,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  public async updateBusiness(
    id: string,
    vendorId: string,
    data: UpdateBusinessDTO,
    isSuperAdmin = false,
  ): Promise<IBusinessDocument> {
    const business = await BusinessModel.findById(id);
    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${id} not found`);
    }

    if (!isSuperAdmin && business.vendorId.toString() !== vendorId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Access denied: You do not have permission to update this business',
      );
    }

    Object.assign(business, data);
    return business.save();
  }

  public async updateBusinessStatus(
    id: string,
    status: BusinessApprovalStatus,
  ): Promise<IBusinessDocument> {
    const business = await BusinessModel.findById(id);
    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${id} not found`);
    }

    business.status = status;
    return business.save();
  }

  public async recalculateBusinessRating(businessId: string): Promise<void> {
    const ReviewModel = mongoose.model('Review');
    const result = await ReviewModel.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          status: 'PUBLISHED',
        },
      },
      {
        $group: {
          _id: '$businessId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      const avg = Math.round(result[0].averageRating * 10) / 10;
      const count = result[0].totalReviews;
      await BusinessModel.findByIdAndUpdate(businessId, {
        averageRating: avg,
        totalReviews: count,
      });
    } else {
      await BusinessModel.findByIdAndUpdate(businessId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  }
}

export const businessService = new BusinessService();
