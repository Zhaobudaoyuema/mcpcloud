import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarketServer } from '@/types';

interface MarketServerCardProps {
  server: MarketServer;
  onClick: (server: MarketServer) => void;
}

const MarketServerCard: React.FC<MarketServerCardProps> = ({ server, onClick }) => {
  const { t } = useTranslation();

  // Get initials for avatar
  const getAuthorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Intelligently calculate how many tags to display to ensure they fit in a single line
  const getTagsToDisplay = () => {
    if (!server.tags || server.tags.length === 0) {
      return { tagsToShow: [], hasMore: false, moreCount: 0 };
    }

    // Estimate available width in the card (in characters)
    const estimatedAvailableWidth = 28; // Estimated number of characters that can fit in one line

    // Calculate the character space needed for tags and plus sign (including # and spacing)
    const calculateTagWidth = (tag: string) => tag.length + 3; // +3 for # and spacing

    // Loop to determine the maximum number of tags that can be displayed
    let totalWidth = 0;
    let i = 0;

    // First, sort tags by length to prioritize displaying shorter tags
    const sortedTags = [...server.tags].sort((a, b) => a.length - b.length);

    // Calculate how many tags can fit
    for (i = 0; i < sortedTags.length; i++) {
      const tagWidth = calculateTagWidth(sortedTags[i]);

      // If this tag would make the total width exceed available width, stop adding
      if (totalWidth + tagWidth > estimatedAvailableWidth) {
        break;
      }

      totalWidth += tagWidth;

      // If this is the last tag but there's still space, no need to show "more"
      if (i === sortedTags.length - 1) {
        return {
          tagsToShow: sortedTags,
          hasMore: false,
          moreCount: 0
        };
      }
    }

    // If there's not enough space to display any tags, show at least one
    if (i === 0 && sortedTags.length > 0) {
      i = 1;
    }

    // Calculate space needed for the "more" tag
    const moreCount = sortedTags.length - i;
    const moreTagWidth = 3 + String(moreCount).length + t('market.moreTags').length;

    // If there's enough remaining space to display the "more" tag
    if (totalWidth + moreTagWidth <= estimatedAvailableWidth || i < 1) {
      return {
        tagsToShow: sortedTags.slice(0, i),
        hasMore: true,
        moreCount
      };
    }

    // If there's not enough space for even the "more" tag, reduce one tag to make room
    return {
      tagsToShow: sortedTags.slice(0, Math.max(1, i - 1)),
      hasMore: true,
      moreCount: moreCount + 1
    };
  };

  const { tagsToShow, hasMore, moreCount } = getTagsToDisplay();

  return (
    <div
      className="warm-card-hover relative flex h-full cursor-pointer flex-col overflow-hidden rounded-warm-card border border-warm-camel/40 bg-warm-cream p-4 shadow-warm-sm transition-all duration-300"
      onClick={() => onClick(server)}
    >

      {/* Server Header */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="mr-2 mb-1 line-clamp-1 text-lg font-semibold text-warm-ink transition-colors duration-200 group-hover:text-warm-caramel">
              {server.display_name}
            </h3>

            {/* Author Section */}
            <div className="mb-1 flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warm-terracotta text-xs font-semibold text-warm-cream">
                {getAuthorInitials(server.author?.name || t('market.unknown'))}
              </div>
              <div>
                <p className="text-xs font-medium text-warm-warmGray">
                  {server.author?.name || t('market.unknown')}
                </p>
              </div>
            </div>
          </div>

          {/* Server Type Badge */}
          <div className="flex flex-col items-end space-y-2">
            {server.is_official && (
              <span className="inline-flex items-center rounded-full bg-warm-beige px-2.5 py-0.5 text-xs font-medium text-warm-caramel">
                {t('market.official')}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-2 flex-1">
          <p className="min-h-[36px] text-sm leading-relaxed text-warm-warmGray line-clamp-2">
            {server.description}
          </p>
        </div>

        {/* Categories */}
        <div className="mb-2">
          <div className="flex min-h-[24px] flex-wrap gap-1">
            {server.categories?.length > 0 ? (
              server.categories.map((category, index) => (
                <span
                  key={index}
                  className="whitespace-nowrap rounded-full bg-warm-beige px-2 py-1 text-xs text-warm-warmGray"
                >
                  {category}
                </span>
              ))
            ) : (
              <span className="py-1 text-xs text-warm-warmGray">-</span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-2">
          <div className="relative min-h-[24px] overflow-x-auto">
            {server.tags?.length > 0 ? (
              <div className="flex items-center gap-1 whitespace-nowrap">
                {tagsToShow.map((tag, index) => (
                  <span
                    key={index}
                    className="flex-shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                  >
                    #{tag}
                  </span>
                ))}
                {hasMore && (
                  <span className="flex-shrink-0 rounded-full bg-warm-beige px-1.5 py-1 text-xs text-warm-warmGray">
                    +{moreCount} {t('market.moreTags')}
                  </span>
                )}
              </div>
            ) : (
              <span className="py-1 text-xs text-warm-warmGray">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketServerCard;