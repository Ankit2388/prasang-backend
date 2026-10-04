
import { BusinessModel } from './business.model.js';
import {
  IBusinessDocument,
  CreateBusinessDTO,
  UpdateBusinessDTO,
  BusinessQueryFilters,
  BusinessApprovalStatus,
} from './business.interface.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class BusinessService {
  public async createBusiness(data: CreateBusinessDTO): Promise<IBusinessDocument> {
    const existing = await BusinessModel.findOne({ vendorId: data.vendorId });
    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A business profile already exists for this vendor account',
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
      contactInformation: data.contactInformation,
      capacity: data.capacity,
      businessHours: data.businessHours || [],
      status: data.status || 'APPROVED',
    });

    return business.save();
  }

  public async getBusinessById(id: string): Promise<IBusinessDocument> {
    const business = await BusinessModel.findById(id).populate({
      path: 'vendorId',
      populate: { path: 'userId', select: 'firstName lastName mobileNumber email' },
    });

    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${id} not found`);
    }

    return business;
  }

  public async getBusinessByVendorId(vendorId: string): Promise<IBusinessDocument | null> {
    return BusinessModel.findOne({ vendorId }).populate({
      path: 'vendorId',
      populate: { path: 'userId', select: 'firstName lastName mobileNumber email' },
    });
  }

  public async getAllApprovedBusinesses(
    filters: BusinessQueryFilters = {},
  ): Promise<{ businesses: IBusinessDocument[]; total: number; page: number; limit: number }> {
    const query: Record<string, unknown> = {
      status: filters.status || 'APPROVED',
    };

    if (filters.city) {
      query.city = { $regex: new RegExp(`^${filters.city}$`, 'i') };
    }

    if (filters.cuisine) {
      query.cuisineTypes = { $in: [new RegExp(filters.cuisine, 'i')] };
    }

    if (filters.search) {
      query.$or = [
        { businessName: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { city: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.minCapacity) {
      query['capacity.maxGuests'] = { $gte: filters.minCapacity };
    }

    if (filters.minRating) {
      query.averageRating = { $gte: filters.minRating };
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [businesses, total] = await Promise.all([
      BusinessModel.find(query)
        .populate({
          path: 'vendorId',
          select: 'firstName lastName status userId',
          populate: { path: 'userId', select: 'firstName lastName mobileNumber email' },
        })
        .sort({ averageRating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BusinessModel.countDocuments(query),
    ]);

    return { businesses, total, page, limit };
  }

  public async updateBusiness(
    id: string,
    vendorId: string,
    updateData: UpdateBusinessDTO,
  ): Promise<IBusinessDocument> {
    const business = await BusinessModel.findById(id);
    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${id} not found`);
    }

    if (business.vendorId.toString() !== vendorId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to update this business profile',
      );
    }

    Object.assign(business, updateData);
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
}

export const businessService = new BusinessService();
