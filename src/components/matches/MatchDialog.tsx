
import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/football";

const matchSchema = z.object({
    home_team_id: z.coerce.number().min(1, "Select home team"),
    away_team_id: z.coerce.number().min(1, "Select away team"),
    date_time: z.string().min(1, "Select date and time"),
    venue: z.string().min(2, "Venue is required"),
    status: z.enum(["SCHEDULED", "IN_PLAY", "FINISHED"]),
    home_score: z.coerce.number().min(0).default(0),
    away_score: z.coerce.number().min(0).default(0),
}).refine((data) => data.home_team_id !== data.away_team_id, {
    message: "Home and Away teams must be different",
    path: ["away_team_id"],
});

type MatchFormValues = z.infer<typeof matchSchema>;

interface MatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matchToEdit?: Match | null;
    onSuccess: () => void;
}

export function MatchDialog({
    open,
    onOpenChange,
    matchToEdit,
    onSuccess,
}: MatchDialogProps) {
    const { toast } = useToast();
    const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);

    const form = useForm<MatchFormValues>({
        resolver: zodResolver(matchSchema),
        defaultValues: {
            home_team_id: 0,
            away_team_id: 0,
            date_time: "",
            venue: "",
            status: "SCHEDULED",
            home_score: 0,
            away_score: 0,
        },
    });

    useEffect(() => {
        const fetchTeams = async () => {
            const { data, error } = await supabase
                .from("teams")
                .select("id, name")
                .order("name");

            if (error) {
                toast({
                    title: "Error fetching teams",
                    description: error.message,
                    variant: "destructive",
                });
                return;
            }

            setTeams(data || []);
        };

        if (open) {
            fetchTeams();
        }
    }, [open, toast]);

    useEffect(() => {
        if (matchToEdit) {
            // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
            const date = new Date(matchToEdit.date_time);
            const formattedDate = date.toISOString().slice(0, 16);

            form.reset({
                home_team_id: matchToEdit.home_team_id,
                away_team_id: matchToEdit.away_team_id,
                date_time: formattedDate,
                venue: matchToEdit.venue || "",
                status: matchToEdit.status,
                home_score: matchToEdit.home_score,
                away_score: matchToEdit.away_score,
            });
        } else {
            form.reset({
                home_team_id: 0,
                away_team_id: 0,
                date_time: "",
                venue: "",
                status: "SCHEDULED",
                home_score: 0,
                away_score: 0,
            });
        }
    }, [matchToEdit, open, form]);

    const onSubmit = async (values: MatchFormValues) => {
        try {
            const submissionData = {
                ...values,
                date_time: new Date(values.date_time).toISOString(),
            };

            if (matchToEdit) {
                const { error } = await supabase
                    .from("matches")
                    .update(submissionData)
                    .eq("id", matchToEdit.id);

                if (error) throw error;
                toast({ title: "Match updated successfully" });
            } else {
                const { error } = await supabase
                    .from("matches")
                    .insert(submissionData);

                if (error) throw error;
                toast({ title: "Match scheduled successfully" });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error saving match",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{matchToEdit ? "Edit Match" : "Schedule Match"}</DialogTitle>
                    <DialogDescription>
                        {matchToEdit
                            ? "Update match details."
                            : "Schedule a new match fixture."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="home_team_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Home Team</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value ? field.value.toString() : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teams.map((team) => (
                                                    <SelectItem key={team.id} value={team.id.toString()}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="away_team_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Away Team</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value ? field.value.toString() : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teams.map((team) => (
                                                    <SelectItem key={team.id} value={team.id.toString()}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date & Time</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="venue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Venue</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Stadium Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                            <SelectItem value="IN_PLAY">Live</SelectItem>
                                            <SelectItem value="FINISHED">Finished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {(form.watch("status") === "IN_PLAY" || form.watch("status") === "FINISHED") && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg">
                                <FormField
                                    control={form.control}
                                    name="home_score"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Home Score</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="away_score"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Away Score</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Match</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
