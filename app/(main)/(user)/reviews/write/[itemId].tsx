/**
 * ==============================================
 * WRITE REVIEW SCREEN - Create/Edit Review
 * ==============================================
 * Full review form with:
 * - Star rating input
 * - Quick tags / suggestion chips
 * - Text comment
 * - Media upload (photos + video)
 * - Anonymous toggle (commented for future)
 * - Gamification incentive banner
 */

import { VideoPlayerModal } from '@/components/ui/VideoPlayerModal';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import Gallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
    AnonymousToggle,
    IncentiveBanner,
    MediaUploader,
    QuickTagChips,
    ReviewTextInput,
    StarRatingInput,
} from '@/components/reviews/form';
import { ReviewProductSnippet } from '@/components/reviews/shared';
import { IconSymbol } from '@/components/ui/Icon';
import {
    useCreateReview,
    useReviewMediaUpload,
    useUpdateReview,
} from '@/hooks/api/review';
import { ReviewFormSchema, type ReviewFormValues, type ReviewMediaItem } from '@/types/review';
import { toCreateReviewRequest } from '@/utils/adapter/review/reviewAdapter';
import { Alert } from '@/utils/AlertHelper';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import Toast from 'react-native-toast-message';

const log = createLogger('WriteReview');

export default function WriteReviewScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    // Get params from URL
    const params = useLocalSearchParams();
    const _itemId = params.itemId as string;
    const orderId = (params.orderId as string) || '';
    const productId = (params.productId as string) || '';
    const productName = (params.productName as string) || 'Sản phẩm';
    const productImage = (params.productImage as string) || '';
    const variantAttributes = (params.variantAttributes as string) || '';
    const formattedPrice = (params.formattedPrice as string) || '';
    const orderNumber = (params.orderNumber as string) || '';
    const shopName = (params.shopName as string) || '';
    const shopLogo = (params.shopLogo as string) || '';
    const mode = (params.mode as string) || 'create';
    const reviewIdParam = (params.reviewId as string) || '';
    const existingRating = (params.existingRating as string) || '';
    const existingComment = (params.existingComment as string) || '';

    const isEditMode = mode === 'edit' && !!reviewIdParam;

    // Selected tags state
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Full screen image viewer state
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    // Video player modal state
    const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

    // Media upload hook
    const {
        mediaItems,
        pickImages,
        pickVideo,
        takePhoto,
        takeVideo,
        removeMedia,
        retryUpload,
        getAssetIds,
        allUploadsComplete,
        hasPendingUploads,
    } = useReviewMediaUpload();

    // Count images and videos
    const imageCount = useMemo(
        () => mediaItems.filter((m) => m.type === 'IMAGE').length,
        [mediaItems]
    );
    const videoCount = useMemo(
        () => mediaItems.filter((m) => m.type === 'VIDEO').length,
        [mediaItems]
    );

    // Form setup with react-hook-form + zod
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(ReviewFormSchema),
        defaultValues: {
            rating: existingRating ? parseInt(existingRating, 10) : 0,
            comment: existingComment ? decodeURIComponent(existingComment) : '',
            selectedTags: [],
            isAnonymous: false,
        },
        mode: 'onChange',
    });

    const currentRating = watch('rating');
    const currentComment = watch('comment');

    // Create/Update mutations
    const createMutation = useCreateReview();
    const updateMutation = useUpdateReview();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    // Handle quick tag toggle
    const handleTagToggle = (tagId: string, tagLabel: string) => {
        const isSelected = selectedTags.includes(tagId);
        const current = currentComment || '';

        if (isSelected) {
            // Remove tag from comment and selectedTags
            const newComment = current.replace(tagLabel, '').trim();
            setSelectedTags((prev) => prev.filter((id) => id !== tagId));
            setValue('comment', newComment, { shouldValidate: true });
        } else {
            // Add tag to comment and selectedTags
            const newComment = current ? `${current} ${tagLabel}` : tagLabel;
            setSelectedTags((prev) => [...prev, tagId]);
            setValue('comment', newComment, { shouldValidate: true });
        }
    };

    /**
     * Show selection menu for images
     */
    const handleAddImages = () => {
        Alert.show({
            title: 'Thêm hình ảnh',
            message: 'Chọn nguồn ảnh bạn muốn sử dụng',
            buttons: [
                { text: 'Chụp ảnh mới', onPress: takePhoto },
                { text: 'Chọn từ thư viện', onPress: pickImages },
                { text: 'Hủy', style: 'cancel' },
            ]
        });
    };

    /**
     * Show selection menu for videos
     */
    const handleAddVideo = () => {
        Alert.show({
            title: 'Thêm video',
            message: 'Chọn nguồn video bạn muốn sử dụng',
            buttons: [
                { text: 'Quay video mới', onPress: takeVideo },
                { text: 'Chọn từ thư viện', onPress: pickVideo },
                { text: 'Hủy', style: 'cancel' },
            ]
        });
    };

    /**
     * Handle media thumbnail press
     */
    const handleMediaPress = (item: ReviewMediaItem) => {
        if (item.type === 'VIDEO') {
            setCurrentVideoUrl(item.uri);
            setIsVideoPlayerVisible(true);
        } else {
            // Find index of this image among all images
            const imagesOnly = mediaItems.filter(m => m.type === 'IMAGE');
            const index = imagesOnly.findIndex(img => img.id === item.id);
            setViewerIndex(index >= 0 ? index : 0);
            setIsViewerVisible(true);
        }
    };

    // Filter only images for gallery
    const galleryImages = useMemo(() =>
        mediaItems
            .filter(item => item.type === 'IMAGE')
            .map(item => ({ uri: item.uri, id: item.id }))
        , [mediaItems]);

    // Submit handler
    const onSubmit = async (data: ReviewFormValues) => {
        if (hasPendingUploads()) {
            Alert.show({
                title: 'Đang tải lên',
                message: 'Vui lòng chờ tải lên hoàn tất trước khi gửi đánh giá.',
                type: 'warning',
            });
            return;
        }

        try {
            if (isEditMode && reviewIdParam) {
                // Update existing review
                await updateMutation.mutateAsync({
                    reviewId: reviewIdParam,
                    payload: {
                        rating: data.rating,
                        comment: data.comment,
                    },
                });
                Toast.show({
                    type: 'success',
                    text1: 'Cập nhật thành công',
                    text2: 'Đánh giá của bạn đã được cập nhật.',
                });
            } else {
                // Create new review
                const payload = toCreateReviewRequest({
                    productId: productId,
                    orderId: orderId,
                    rating: data.rating,
                    comment: data.comment,
                    mediaAssetIds: getAssetIds(),
                });

                await createMutation.mutateAsync(payload);
                Toast.show({
                    type: 'success',
                    text1: 'Đánh giá thành công',
                    text2: 'Cảm ơn bạn đã chia sẻ trải nghiệm!',
                });
            }

            // Navigate back
            Navigator.back();
        } catch (error) {
            log.error('Submit review failed:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể gửi đánh giá. Vui lòng thử lại.',
            });
        }
    };

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
        return (
            currentRating > 0 &&
            !isSubmitting &&
            !hasPendingUploads() &&
            allUploadsComplete()
        );
    }, [currentRating, isSubmitting, hasPendingUploads, allUploadsComplete]);

    return (
        <View style={styles.container}>
            {/* Header - using safe area insets */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => Navigator.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <IconSymbol
                            name="arrow-back"
                            size={24}
                            color={theme.colors.typography}
                        />
                    </Pressable>
                    <Text style={styles.headerTitle}>
                        {isEditMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
                    </Text>
                    <View style={styles.headerPlaceholder} />
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Product Info Card */}
                    <View style={styles.card}>
                        <ReviewProductSnippet
                            productName={productName}
                            imageUrl={productImage}
                            variantAttributes={variantAttributes || null}
                            price={formattedPrice}
                            shopName={shopName}
                            shopLogo={shopLogo}
                            orderNumber={orderNumber}
                            showOrderInfo={!!orderNumber}
                        />
                    </View>

                    {/* Incentive Banner - only for new reviews */}
                    {!isEditMode && (
                        <View style={styles.bannerWrapper}>
                            <IncentiveBanner
                                photoCount={imageCount}
                                hasVideo={videoCount > 0}
                            />
                        </View>
                    )}

                    {/* Main Review Card */}
                    <View style={styles.card}>
                        {/* Star Rating */}
                        <View style={styles.ratingSection}>
                            <Text style={styles.sectionLabel}>
                                Chất lượng sản phẩm
                            </Text>
                            <Controller
                                control={control}
                                name="rating"
                                render={({ field: { value, onChange } }) => (
                                    <StarRatingInput
                                        value={value}
                                        onChange={onChange}
                                        size={44}
                                        showLabel
                                        hasError={!!errors.rating}
                                    />
                                )}
                            />
                            {errors.rating && (
                                <Text style={styles.errorText}>
                                    {errors.rating.message}
                                </Text>
                            )}
                        </View>

                        {/* Quick Tags - only show when rating is selected */}
                        {currentRating > 0 && (
                            <View style={styles.tagSection}>
                                <QuickTagChips
                                    rating={currentRating}
                                    selectedTags={selectedTags}
                                    onTagToggle={handleTagToggle}
                                />
                            </View>
                        )}

                        {/* Comment Input */}
                        <View style={styles.inputSection}>
                            <Controller
                                control={control}
                                name="comment"
                                render={({ field: { value, onChange } }) => (
                                    <ReviewTextInput
                                        value={value}
                                        onChange={onChange}
                                        placeholder="Chia sẻ thêm cảm nhận của bạn về sản phẩm này nhé..."
                                        maxLength={1000}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    {/* Media Upload Card - only for new reviews */}
                    {!isEditMode && (
                        <View style={styles.card}>
                            <Text style={styles.sectionLabel}>
                                Hình ảnh & Video thực tế
                            </Text>
                            <MediaUploader
                                mediaItems={mediaItems}
                                onPickImages={handleAddImages}
                                onPickVideo={handleAddVideo}
                                onMediaPress={handleMediaPress}
                                onRemove={removeMedia}
                                onRetry={retryUpload}
                                imageCount={imageCount}
                                videoCount={videoCount}
                            />
                        </View>
                    )}

                    {/* Anonymous Toggle */}
                    <View style={styles.anonymousSection}>
                        <Controller
                            control={control}
                            name="isAnonymous"
                            render={({ field: { value, onChange } }) => (
                                <AnonymousToggle
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                        />
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <Pressable
                        style={[
                            styles.submitButton,
                            !canSubmit && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={!canSubmit}
                    >
                        {isSubmitting ? (
                            <Text style={styles.submitButtonText}>
                                Đang gửi...
                            </Text>
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isEditMode ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

            {/* Full Screen Image Viewer */}
            <Modal
                visible={isViewerVisible}
                transparent={true}
                onRequestClose={() => setIsViewerVisible(false)}
                animationType="fade"
            >
                <View style={viewerStyles.container}>
                    <Gallery
                        data={galleryImages}
                        keyExtractor={(item) => item.id}
                        initialIndex={viewerIndex}
                        onIndexChange={setViewerIndex}
                        onSwipeToClose={() => setIsViewerVisible(false)}
                        renderItem={({ item, setImageDimensions }: RenderItemInfo<{ uri: string; id: string }>) => (
                            <Image
                                source={{ uri: item.uri }}
                                style={viewerStyles.image}
                                contentFit="contain"
                                onLoad={(e) => {
                                    const { width, height } = e.source;
                                    setImageDimensions({ width, height });
                                }}
                            />
                        )}
                    />
                    {/* Viewer Header with Close Button */}
                    <View style={[viewerStyles.header, { top: insets.top }]}>
                        <Pressable
                            style={viewerStyles.closeButton}
                            onPress={() => setIsViewerVisible(false)}
                        >
                            <IconSymbol name="close" size={24} color="#FFF" />
                        </Pressable>
                        <Text style={viewerStyles.headerText}>
                            {viewerIndex + 1} / {galleryImages.length}
                        </Text>
                        <View style={viewerStyles.headerSpacer} />
                    </View>
                </View>

                <StatusBar style="light" hidden />
            </Modal>

            {/* Video Player Modal */}
            {currentVideoUrl && (
                <VideoPlayerModal
                    visible={isVideoPlayerVisible}
                    videoUrl={currentVideoUrl}
                    onClose={() => {
                        setIsVideoPlayerVisible(false);
                        setCurrentVideoUrl(null);
                    }}
                />
            )}
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6', // Slightly grey background to make white cards pop
    },
    header: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -theme.margins.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        flex: 1,
        textAlign: 'center',
    },
    headerPlaceholder: {
        width: 40,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: theme.margins.md,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
        padding: theme.margins.md,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 3,
    },
    bannerWrapper: {
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    ratingSection: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    tagSection: {
        marginTop: theme.margins.md,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    inputSection: {
        marginTop: theme.margins.md,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
    },
    anonymousSection: {
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.xl,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 8,
    },
    footer: {
        padding: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingBottom: Platform.OS === 'ios' ? 34 : theme.margins.md, // Handle safe area for home indicator
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.full, // Modern rounded button
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.secondaryLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
}));

const viewerStyles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    headerSpacer: {
        width: 44,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}));
