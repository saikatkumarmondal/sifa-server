// server/utils/nestedCategories.js
const nestedCategories = (categories, parentId = null) => {
  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parent_category_id == null);
  } else {
    category = categories.filter(
      (cat) =>
        cat.parent_category_id &&
        cat.parent_category_id.toString() === parentId.toString()
    );
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      parent_category_id: cate.parent_category_id || null,
      brand: cate.brand || null,
      partType: cate.partType || null,
      material: cate.material || null,
      dimensions: cate.dimensions || null,
      installSize: cate.installSize || null,
      faceplateSize: cate.faceplateSize || null,
      weight: cate.weight || null,
      application: cate.application || null,
      warrantyTime: cate.warrantyTime || null,
      certificates: cate.certificates || null,
      moq: cate.moq || null,
      shippingTerms: cate.shippingTerms || null,
      paymentTerms: cate.paymentTerms || null,
      paymentCurrency: cate.paymentCurrency || null,
      packing: cate.packing || null,
      description: cate.description || null,
      image: cate.image || null,
      images: cate.images || [],
      createdAt: cate.createdAt,
      updatedAt: cate.updatedAt,

      // recursively add children
      children: nestedCategories(categories, cate._id),
    });
  }

  return categoryList;
};

module.exports = nestedCategories;
