'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Camera, Mail, Phone, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return '😎';
  };

  const handleSaveChanges = async (event: ChangeEvent<HTMLFormElement>) => {
    if (!user) return;

    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    try {
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          phoneNumber: phone,
          address: address,
        },
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image size should be less than 1MB');
      return;
    }

    try {
      await user.setProfileImage({ file });
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture. Please try again.');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
          <Card className="border-gray-200 bg-white shadow-none">
            <CardContent className="space-y-8 p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Skeleton className="h-10 w-40 sm:w-48 bg-gray-100" />
                <Skeleton className="h-10 w-full sm:w-32 bg-gray-100" />
              </div>

              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <Skeleton className="h-24 w-24 rounded-full bg-gray-100" />
                <div className="space-y-3 w-full sm:w-auto">
                  <Skeleton className="h-6 w-32 sm:w-40 bg-gray-100 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-52 sm:w-64 bg-gray-100 mx-auto sm:mx-0" />
                  <Skeleton className="h-10 w-32 sm:w-36 bg-gray-100 mx-auto sm:mx-0" />
                </div>
              </div>

              {/* Form Skeleton */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20 sm:w-24 bg-gray-100" />
                    <Skeleton className="h-12 w-full bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20 sm:w-24 bg-gray-100" />
                    <Skeleton className="h-12 w-full bg-gray-100" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b pt-16 from-gray-50 via-white to-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Card className="border bg-white shadow-none">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  My Profile
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your personal information
                </p>
              </div>
              <Button
                variant="outline"
                className="shadow-none cursor-pointer w-full sm:w-auto"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Profile Picture Section */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage
                      src={user?.imageUrl || '/placeholder.svg'}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <button
                    onClick={triggerFileInput}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black text-white"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    Profile Picture
                  </h3>
                  <p className="mb-3 text-sm text-gray-600">
                    Upload a new profile picture to personalize your account
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                    onClick={triggerFileInput}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Change Picture
                  </Button>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveChanges} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <User className="h-4 w-4 text-primary" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={user?.firstName || ''}
                    className="h-12 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-60"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={user?.lastName || ''}
                    className="h-12 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-60"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={
                      (user?.unsafeMetadata?.phoneNumber as string) || ''
                    }
                    className="h-12 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-60"
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.emailAddresses[0]?.emailAddress || ''}
                    disabled
                    className="h-12 border-gray-200 bg-gray-50 text-gray-500 opacity-60"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={(user?.unsafeMetadata?.address as string) || ''}
                  disabled={!isEditing}
                  className="h-12 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-60"
                  placeholder="Enter your address"
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    className="w-full sm:w-auto px-8"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto shadow-none cursor-pointer"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    type="button"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
