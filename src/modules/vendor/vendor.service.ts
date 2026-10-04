import { VendorModel } from './vendor.model.js';
import { IVendorDocument } from './vendor.interface.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class VendorService {
  public async getVendorByUserId(userId: string): Promise<IVendorDocument | null> {
    return VendorModel.findOne({ userId }).populate('userId', '-password');
  }

  public async getVendorById(id: string): Promise<IVendorDocument> {
    const vendor = await VendorModel.findById(id).populate('userId', '-password');
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  public async getAllApprovedVendors(): Promise<IVendorDocument[]> {
    return VendorModel.find({ status: 'APPROVED' })
      .populate('userId', 'name mobileNumber email')
      .sort({ createdAt: -1 });
  }

  public async createVendorProfile(data: {
    userId: string;
    businessName: string;
    ownerName: string;
    city?: string;
    address?: string;
    cuisineTypes?: string[];
  }): Promise<IVendorDocument> {
    const existing = await VendorModel.findOne({ userId: data.userId });
    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Vendor profile already exists for this user account',
      );
    }

    const vendor = new VendorModel({
      userId: data.userId,
      businessName: data.businessName,
      ownerName: data.ownerName,
      city: data.city,
      address: data.address,
      cuisineTypes: data.cuisineTypes || [],
      status: 'APPROVED',
    });

    return vendor.save();
  }
}

export const vendorService = new VendorService();
