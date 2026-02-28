import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { saveProfileImage } from "@/lib/actions/settings";
import { validateProfileImageContents, validateProfileImageFile } from "@/lib/validators/settings";

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image file is required." }, { status: 400 });
  }

  const validationError = validateProfileImageFile(file);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }
  const contentError = await validateProfileImageContents(file);
  if (contentError) {
    return NextResponse.json({ message: contentError }, { status: 400 });
  }

  try {
    await saveProfileImage(user.id, file);
    return NextResponse.json({ message: "Profile photo updated." });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to upload profile photo."
      },
      { status: 500 }
    );
  }
}
