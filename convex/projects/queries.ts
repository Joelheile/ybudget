import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

    export const getAllProjects = query({
    handler: async (ctx) => {
      const user = await getCurrentUser(ctx);
      if (!user) return [];
  
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .collect();
      return projects;
    },
  });

  export const getChildProjects = query({
    args: { parentId: v.string() },
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return [];
  
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .filter((q) => q.eq(q.field("parentId"), args.parentId as Id<"projects">))
        .collect();
      return projects;
    },
  });
  

  export const getProjectById = query({
    args: { projectId: v.string() },
  
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return null;
  
      const project = await ctx.db.get(args.projectId as Id<"projects">);
      return project;
    },
  });