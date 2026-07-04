const WebsiteContent = require('../models/WebsiteContent.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getContent = async (req, res, next) => {
  try {
    const { page, active } = req.query;
    const filter = {};
    if (page) filter.page = page;
    if (active !== undefined) filter.isActive = active === 'true';

    const content = await WebsiteContent.find(filter).sort({ page: 1, order: 1, key: 1 });
    return successResponse(res, { data: { content } });
  } catch (error) { next(error); }
};

const getContentById = async (req, res, next) => {
  try {
    const item = await WebsiteContent.findById(req.params.id);
    if (!item) return errorResponse(res, { statusCode: 404, message: 'Content block not found.' });
    return successResponse(res, { data: { content: item } });
  } catch (error) { next(error); }
};

const createContent = async (req, res, next) => {
  try {
    const item = await WebsiteContent.create(req.body);
    return successResponse(res, { statusCode: 201, message: 'Content block created.', data: { content: item } });
  } catch (error) { next(error); }
};

const updateContent = async (req, res, next) => {
  try {
    const item = await WebsiteContent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return errorResponse(res, { statusCode: 404, message: 'Content block not found.' });
    return successResponse(res, { message: 'Content block updated.', data: { content: item } });
  } catch (error) { next(error); }
};

const deleteContent = async (req, res, next) => {
  try {
    const item = await WebsiteContent.findByIdAndDelete(req.params.id);
    if (!item) return errorResponse(res, { statusCode: 404, message: 'Content block not found.' });
    return successResponse(res, { message: 'Content block deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getContent, getContentById, createContent, updateContent, deleteContent };
