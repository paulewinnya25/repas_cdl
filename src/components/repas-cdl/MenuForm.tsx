import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WeeklyMenuItem } from "@/types/repas-cdl";
import { useState } from "react";
import { showError } from "@/utils/toast";

const menuFormSchema = z.object({
  dish_name: z.string().min(3, { message: "Le nom du plat doit contenir au moins 3 caractères." }),
  description: z.string().optional(),
  photo_url: z.any(),
});

export type MenuFormData = z.infer<typeof menuFormSchema>;

interface MenuFormProps {
  menuItem: Partial<WeeklyMenuItem>;
  onSubmit: (values: MenuFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const MenuForm = ({ menuItem, onSubmit, onCancel, isSubmitting }: MenuFormProps) => {
  const [preview, setPreview] = useState<string | null>(menuItem?.photo_url || null);
  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      dish_name: menuItem?.dish_name || "",
      description: menuItem?.description || "",
      photo_url: menuItem?.photo_url || null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          showError("La vidéo ne doit pas dépasser 60 secondes.");
          e.target.value = "";
          return;
        }
        setPreview(URL.createObjectURL(file));
        form.setValue("photo_url", file);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setPreview(URL.createObjectURL(file));
      form.setValue("photo_url", file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
            <p className="font-semibold text-lg">{menuItem.day_of_week} - {menuItem.meal_type}</p>
        </div>
        <FormField
          control={form.control}
          name="dish_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du plat</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Poulet Yassa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Brève description du plat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Photo / Vidéo</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
          </FormControl>
          {preview && (
            <div className="mt-2">
              {preview.startsWith('blob:') ? (
                form.getValues("photo_url")?.type?.startsWith("video/") ? (
                  <video src={preview} controls className="w-full h-auto rounded-md" />
                ) : (
                  <img src={preview} alt="Aperçu" className="w-full h-auto rounded-md" />
                )
              ) : (
                <img src={preview} alt="Aperçu" className="w-full h-auto rounded-md" />
              )}
            </div>
          )}
          <FormMessage />
        </FormItem>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};