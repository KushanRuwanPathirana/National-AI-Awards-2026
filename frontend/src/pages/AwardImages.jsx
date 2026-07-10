import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiImageLine, RiFilterLine, RiCloseLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';
import { awardImageService, awardImageCategoryService } from '../services/awardImage.service';
import { buildAssetUrl } from '../services/api';
import toast from 'react-hot-toast';

const AwardImages = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filteredImages, setFilteredImages] = useState([]);

  const years = [2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, selectedCategory, selectedYear]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await awardImageService.getAllImages({ status: 'active' });
      setImages(response.data.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await awardImageCategoryService.getAllCategories({ status: 'active' });
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterImages = () => {
    let filtered = [...images];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.categoryId?._id === selectedCategory);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(img => img.eventYear === parseInt(selectedYear));
    }

    setFilteredImages(filtered);
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const currentImage = filteredImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/30 mb-6">
              <RiImageLine className="w-5 h-5 text-accent-400" />
              <span className="text-accent-400 font-medium">Gallery</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Award Images
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Browse official images from the AI Awards, including event highlights, judges, speakers, 
              networking sessions, media coverage, and award ceremony moments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            {/* Category Filter */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <RiFilterLine className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 w-full sm:w-auto"
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-gray-400 text-sm">
              {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <RiImageLine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No images found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white/5 border border-white/10"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={buildAssetUrl(image.imageUrl)}
                      alt={image.altText || image.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                        {image.title}
                      </h3>
                      {image.caption && (
                        <p className="text-gray-300 text-xs line-clamp-2">{image.caption}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {image.categoryId && (
                          <span className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded-full">
                            {image.categoryId.name}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
                          {image.eventYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <RiCloseLine className="w-8 h-8" />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <RiArrowLeftLine className="w-10 h-10" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <RiArrowRightLine className="w-10 h-10" />
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={buildAssetUrl(currentImage.imageUrl)}
              alt={currentImage.altText || currentImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{currentImage.title}</h3>
              {currentImage.caption && (
                <p className="text-gray-300 mt-2">{currentImage.caption}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-3">
                {currentImage.categoryId && (
                  <span className="px-3 py-1 bg-accent-500/20 text-accent-400 text-sm rounded-full">
                    {currentImage.categoryId.name}
                  </span>
                )}
                <span className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full">
                  {currentImage.eventYear}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardImages;
