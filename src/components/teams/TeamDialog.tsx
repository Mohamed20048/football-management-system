
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/football";

const teamSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    coach_name: z.string().optional(),
    founded_year: z.coerce.number().min(1800).max(new Date().getFullYear()).optional().or(z.literal("")),
    stadium: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamToEdit?: Team | null;
    onSuccess: () => void;
}

export function TeamDialog({
    open,
    onOpenChange,
    teamToEdit,
    onSuccess,
}: TeamDialogProps) {
    const { toast } = useToast();

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: "",
            coach_name: "",
            founded_year: "",
            stadium: "",
        },
    });

    useEffect(() => {
        if (teamToEdit) {
            form.reset({
                name: teamToEdit.name,
                coach_name: teamToEdit.coach_name || "",
                founded_year: teamToEdit.founded_year || "",
                stadium: teamToEdit.stadium || "",
            });
        } else {
            form.reset({
                name: "",
                coach_name: "",
                founded_year: "",
                stadium: "",
            });
        }
    }, [teamToEdit, open, form]);

    const onSubmit = async (values: TeamFormValues) => {
        try {
            const submissionData = {
                name: values.name,
                coach_name: values.coach_name || null,
                founded_year: values.founded_year ? Number(values.founded_year) : null,
                stadium: values.stadium || null,
            };

            if (teamToEdit) {
                const { error } = await supabase
                    .from("teams")
                    .update(submissionData)
                    .eq("id", teamToEdit.id);

                if (error) throw error;
                toast({ title: "Team updated successfully" });
            } else {
                const { error } = await supabase
                    .from("teams")
                    .insert(submissionData);

                if (error) throw error;
                toast({ title: "Team created successfully" });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error saving team",
                description: error.message || "Please try again later",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{teamToEdit ? "Edit Team" : "Add New Team"}</DialogTitle>
                    <DialogDescription>
                        {teamToEdit
                            ? "Update team details."
                            : "Add a new football team to the system."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="FC Barcelona" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="coach_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Coach Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Pep Guardiola" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stadium"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stadium</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Camp Nou" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="founded_year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Founded Year</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="1899" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Team</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
