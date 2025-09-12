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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Patient, WeeklyMenuItem } from "@/types/repas-cdl";
import { mealTypes } from "@/data/repas-cdl";
import { useEffect } from "react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const orderFormSchema = z.object({
  patient_id: z.string().uuid({ message: "Veuillez sélectionner un patient." }),
  meal_type: z.enum(mealTypes, { required_error: "Veuillez sélectionner un type de repas." }),
  menu: z.string().min(1, { message: "Le menu ne peut pas être vide." }),
  instructions: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  patients: Patient[];
  weeklyMenus: WeeklyMenuItem[];
  onSubmit: (values: OrderFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const OrderForm = ({ patients, weeklyMenus, onSubmit, onCancel, isSubmitting }: OrderFormProps) => {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      instructions: "",
    },
  });

  const selectedMealType = form.watch("meal_type");

  useEffect(() => {
    if (selectedMealType && weeklyMenus) {
      const today = new Date();
      const dayOfWeek = format(today, 'EEEE', { locale: fr });
      const capitalizedDay = (dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)) as WeeklyMenuItem['day_of_week'];

      const menuItem = weeklyMenus.find(
        (item) => item.day_of_week === capitalizedDay && item.meal_type === selectedMealType
      );

      if (menuItem) {
        const fullMenu = `${menuItem.dish_name}${menuItem.description ? ` - ${menuItem.description}` : ''}`;
        form.setValue("menu", fullMenu);
      } else {
        if (weeklyMenus.length === 0) {
            form.setValue("menu", "Le planning des menus est vide.");
        } else {
            form.setValue("menu", `Aucun menu trouvé pour ${capitalizedDay} / ${selectedMealType}.`);
        }
      }
    }
  }, [selectedMealType, weeklyMenus, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - Ch. {p.room}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de repas</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de repas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mealTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="menu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du menu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions spéciales</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Ne pas mettre de sel, couper en petits morceaux..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer la commande"}
          </Button>
        </div>
      </form>
    </Form>
  );
};