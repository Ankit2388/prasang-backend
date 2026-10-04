import { VendorModel } from './vendor.model.js';
import { IVendorDocument, CreateVendorDTO } from './vendor.interface.js';
import { BusinessModel } from '../business/business.model.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class VendorService {
  public async getVendorByUserId(userId: string): Promise<IVendorDocument | null> {
    const vendor = await VendorModel.findOne({ userId }).populate('userId', '-password');
    if (!vendor) return null;

    const business = await BusinessModel.findOne({ vendorId: vendor._id });
    const vendorObj = vendor.toObject() as IVendorDocument;
    if (business) {
      vendorObj.business = business;
    }

    return vendorObj;
  }

  public async getVendorById(id: string): Promise<IVendorDocument> {
    const vendor = await VendorModel.findById(id).populate('userId', '-password');
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Vendor with ID ${id} not found`);
    }

    const business = await BusinessModel.findOne({ vendorId: vendor._id });
    const vendorObj = vendor.toObject() as IVendorDocument;
    if (business) {
      vendorObj.business = business;
    }

    return vendorObj;
  }

  public async getAllApprovedVendors(): Promise<unknown[]> {
    const approvedBusinesses = await BusinessModel.find({ status: 'APPROVED' })
      .populate({
        path: 'vendorId',
        select: 'firstName lastName status userId createdAt updatedAt',
        populate: { path: 'userId', select: 'firstName lastName mobileNumber email' },
      })
      .sort({ averageRating: -1, createdAt: -1 });

    return approvedBusinesses;
  }

  public async createVendorProfile(data: CreateVendorDTO): Promise<IVendorDocument> {
    const existing = await VendorModel.findOne({ userId: data.userId });
    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Vendor profile already exists for this user account',
      );
    }

    const vendor = new VendorModel({
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      status: data.status || 'ACTIVE',
    });

    const savedVendor = await vendor.save();

    const business = new BusinessModel({
      vendorId: savedVendor._id,
      businessName: data.businessName,
      city: data.city,
      address: data.address,
      cuisineTypes: data.cuisineTypes || [],
      status: 'APPROVED',
    });

    const savedBusiness = await business.save();

    const vendorObj = savedVendor.toObject() as IVendorDocument;
    vendorObj.business = savedBusiness;

    return vendorObj;
  }
}

export const vendorService = new VendorService();
