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
import { Switch } from "@/components/ui/switch";
import { EmployeeMenu } from "@/types/repas-cdl";
import { useState } from "react";
import { showError } from "@/utils/toast";

const menuFormSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Le prix doit être positif." }),
  photo_url: z.any(),
  is_available: z.boolean(),
});

export type EmployeeMenuFormData = z.infer<typeof menuFormSchema>;

interface EmployeeMenuFormProps {
  menu?: EmployeeMenu | null;
  onSubmit: (values: EmployeeMenuFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EmployeeMenuForm = ({ menu, onSubmit, onCancel, isSubmitting }: EmployeeMenuFormProps) => {
  const [preview, setPreview] = useState<string | null>(menu?.photo_url || null);
  const form = useForm<EmployeeMenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: menu?.name || "",
      description: menu?.description || "",
      price: menu?.price || 0,
      photo_url: menu?.photo_url || null,
      is_available: menu?.is_available ?? true,
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du plat</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Poulet DG" {...field} />
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
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (XAF)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2500" {...field} />
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
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Disponible</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
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