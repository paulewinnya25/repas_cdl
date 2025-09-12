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
import { EmployeeMenu } from "@/types/repas-cdl";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";

const orderFormSchema = z.object({
  accompaniments: z.number().min(1).max(2),
});

export type EmployeeOrderFormData = z.infer<typeof orderFormSchema>;

interface EmployeeOrderFormProps {
  menu: EmployeeMenu;
  onSubmit: (values: EmployeeOrderFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EmployeeOrderForm = ({ menu, onSubmit, onCancel, isSubmitting }: EmployeeOrderFormProps) => {
  const [accompaniments, setAccompaniments] = useState(1);
  
  const form = useForm<EmployeeOrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      accompaniments: 1,
    },
  });

  const calculatePrice = (basePrice: number, accompaniments: number) => {
    return accompaniments === 2 ? 2000 : basePrice;
  };

  const currentPrice = calculatePrice(menu.price, accompaniments);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Récapitulatif de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Plat :</strong> {menu.name}</p>
            <p><strong>Prix de base :</strong> {menu.price.toLocaleString('fr-FR')} XAF</p>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="accompaniments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre d'accompagnements</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const numValue = parseInt(value);
                  setAccompaniments(numValue);
                  field.onChange(numValue);
                }}
                defaultValue="1"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le nombre d'accompagnements" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 accompagnement - {menu.price.toLocaleString('fr-FR')} XAF</SelectItem>
                  <SelectItem value="2">2 accompagnements - 2 000 XAF</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="mb-4">
          <CardContent className="pt-4">
            <p><strong>Prix total :</strong> {currentPrice.toLocaleString('fr-FR')} XAF</p>
            {accompaniments === 2 && (
              <p className="text-sm text-green-600">✓ Supplément de 500 XAF pour le 2ème accompagnement</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Confirmation..." : "Confirmer la commande"}
          </Button>
        </div>
      </form>
    </Form>
  );
};