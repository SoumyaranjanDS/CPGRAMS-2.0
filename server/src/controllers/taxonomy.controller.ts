import { Request, Response } from 'express';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { SEED_DEPARTMENTS, SEED_CATEGORIES, PIN_DATABASE } from '../seeds/seedData.js';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    let departments = await Department.find({ isActive: true }).lean();
    if (!departments || departments.length === 0) {
      // Return seed data fallback if DB not populated
      departments = SEED_DEPARTMENTS as any;
    }

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: SEED_DEPARTMENTS.length,
      data: SEED_DEPARTMENTS,
      isFallback: true,
    });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.query;
    const filter: Record<string, any> = { isActive: true };
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    let categories = await Category.find(filter).lean();
    if (!categories || categories.length === 0) {
      categories = departmentId
        ? SEED_CATEGORIES.filter((c) => c.departmentId === departmentId)
        : (SEED_CATEGORIES as any);
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: SEED_CATEGORIES.length,
      data: SEED_CATEGORIES,
      isFallback: true,
    });
  }
};

export const resolvePinCode = async (req: Request, res: Response): Promise<void> => {
  const { pinCode } = req.params;

  if (!pinCode || !/^\d{6}$/.test(pinCode)) {
    res.status(400).json({
      success: false,
      error: 'INVALID_PIN_CODE',
      message: 'Please provide a valid 6-digit Indian Postal PIN Code.',
    });
    return;
  }

  const lookup = PIN_DATABASE[pinCode];

  if (lookup) {
    res.status(200).json({
      success: true,
      data: {
        pinCode,
        state: lookup.state,
        district: lookup.district,
        locality: lookup.locality,
        subDivision: lookup.subDivision,
        localBody: lookup.localBody,
        postOffice: lookup.postOffice,
      },
    });
    return;
  }

  // Generative fallback based on standard postal zone prefix
  const zonePrefix = pinCode.charAt(0);
  const stateGuess =
    zonePrefix === '7'
      ? 'Odisha / Eastern Region'
      : zonePrefix === '1'
      ? 'Delhi / Northern Region'
      : zonePrefix === '4'
      ? 'Maharashtra / Western Region'
      : zonePrefix === '5'
      ? 'Andhra / Telangana / Southern Region'
      : 'India';

  res.status(200).json({
    success: true,
    data: {
      pinCode,
      state: stateGuess,
      district: 'District Identified via Postal Zone',
      locality: 'Locality Identified',
      isEstimated: true,
    },
  });
};
