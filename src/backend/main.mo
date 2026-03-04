import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  var entries = Map.empty<Nat, SalesEntry>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public type SalesEntry = {
    id : Nat;
    receivedDate : Text; // yyyy-mm-dd
    leadSource : Text;
    accountName : Text;
    potential : Text;
    notes : Text;
    statusGroup : Text;
    status : Text;
    salesPerson : Text;
    zcrmLink : Text;
    tcv : Float;
    closingDate : Text;
    createdAt : Int;
  };

  type StatusGroupCounts = {
    new : Nat;
    inProgress : Nat;
    closed : Nat;
  };

  type StatusGroupTCV = {
    new : Float;
    inProgress : Float;
    closed : Float;
  };

  type LeadSourceCounts = {
    salesLead : Nat;
    marketingLead : Nat;
    accountMining : Nat;
    referral : Nat;
  };

  type LeadSourceTCV = {
    salesLead : Float;
    marketingLead : Float;
    accountMining : Float;
    referral : Float;
  };

  type DashboardStats = {
    totalEntries : Nat;
    totalTCV : Float;
    countByStatusGroup : StatusGroupCounts;
    tcvByStatusGroup : StatusGroupTCV;
    countByLeadSource : LeadSourceCounts;
    tcvByLeadSource : LeadSourceTCV;
    recentEntries : [SalesEntry];
    upcomingClosings : [SalesEntry];
  };

  module SalesEntry {
    public func compareByReceivedDateDesc(a : SalesEntry, b : SalesEntry) : Order.Order {
      Text.compare(b.receivedDate, a.receivedDate);
    };
  };

  var nextId = 1;

  public shared ({ caller }) func addEntry(
    receivedDate : Text,
    leadSource : Text,
    accountName : Text,
    potential : Text,
    notes : Text,
    statusGroup : Text,
    status : Text,
    salesPerson : Text,
    zcrmLink : Text,
    tcv : Float,
    closingDate : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can add entries");
    };
    let id = nextId;
    let entry : SalesEntry = {
      id;
      receivedDate;
      leadSource;
      accountName;
      potential;
      notes;
      statusGroup;
      status;
      salesPerson;
      zcrmLink;
      tcv;
      closingDate;
      createdAt = Time.now();
    };
    entries.add(id, entry);
    nextId += 1;
    id;
  };

  public query ({ caller }) func getEntries() : async [SalesEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can view entries");
    };
    entries.values().toArray().sort(SalesEntry.compareByReceivedDateDesc);
  };

  public query ({ caller }) func getEntry(id : Nat) : async SalesEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can view entries");
    };
    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?entry) { entry };
    };
  };

  public shared ({ caller }) func updateEntry(
    id : Nat,
    receivedDate : Text,
    leadSource : Text,
    accountName : Text,
    potential : Text,
    notes : Text,
    statusGroup : Text,
    status : Text,
    salesPerson : Text,
    zcrmLink : Text,
    tcv : Float,
    closingDate : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can update entries");
    };
    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?existing) {
        let updated : SalesEntry = {
          id;
          receivedDate;
          leadSource;
          accountName;
          potential;
          notes;
          statusGroup;
          status;
          salesPerson;
          zcrmLink;
          tcv;
          closingDate;
          createdAt = existing.createdAt;
        };
        entries.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can delete entries");
    };
    if (not entries.containsKey(id)) {
      Runtime.trap("Entry not found");
    };
    entries.remove(id);
  };

  public query ({ caller }) func getEntriesByStatusGroup(statusGroup : Text) : async [SalesEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can view entries");
    };
    entries.values().toArray().filter(
      func(entry) { entry.statusGroup == statusGroup }
    );
  };

  public query ({ caller }) func getEntriesByLeadSource(leadSource : Text) : async [SalesEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can view entries");
    };
    entries.values().toArray().filter(
      func(entry) { entry.leadSource == leadSource }
    );
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only guests can view dashboard stats");
    };

    let nowNanos = Time.now();
    let daysSinceEpoch = nowNanos / 1_000_000_000 / 86400;
    let daysSinceEpochNat = daysSinceEpoch.toNat();
    let currentDate = dateFromDays(daysSinceEpochNat);

    var totalTCV = 0.0;
    var newTCV = 0.0;
    var inProgressTCV = 0.0;
    var closedTCV = 0.0;
    var salesLeadTCV = 0.0;
    var marketingLeadTCV = 0.0;
    var accountMiningTCV = 0.0;
    var referralTCV = 0.0;

    var newCount = 0;
    var inProgressCount = 0;
    var closedCount = 0;
    var salesLeadCount = 0;
    var marketingLeadCount = 0;
    var accountMiningCount = 0;
    var referralCount = 0;

    entries.values().forEach(
      func(entry) {
        totalTCV += entry.tcv;
        switch (entry.statusGroup) {
          case ("New") { newTCV += entry.tcv; newCount += 1 };
          case ("In Progress") { inProgressTCV += entry.tcv; inProgressCount += 1 };
          case ("Closed") { closedTCV += entry.tcv; closedCount += 1 };
          case (_) {};
        };
        switch (entry.leadSource) {
          case ("Sales Lead") { salesLeadTCV += entry.tcv; salesLeadCount += 1 };
          case ("Marketing Lead") { marketingLeadTCV += entry.tcv; marketingLeadCount += 1 };
          case ("Account Mining") { accountMiningTCV += entry.tcv; accountMiningCount += 1 };
          case ("Referral") { referralTCV += entry.tcv; referralCount += 1 };
          case (_) {};
        };
      }
    );

    let sortedEntries = entries.values().toArray().sort(SalesEntry.compareByReceivedDateDesc);

    let recentEntries = sortedEntries.sliceToArray(
      0,
      Nat.min(5, sortedEntries.size()),
    );

    let upcomingClosings : [SalesEntry] = [];

    {
      totalEntries = entries.size();
      totalTCV;
      countByStatusGroup = { new = newCount; inProgress = inProgressCount; closed = closedCount };
      tcvByStatusGroup = { new = newTCV; inProgress = inProgressTCV; closed = closedTCV };
      countByLeadSource = {
        salesLead = salesLeadCount;
        marketingLead = marketingLeadCount;
        accountMining = accountMiningCount;
        referral = referralCount;
      };
      tcvByLeadSource = {
        salesLead = salesLeadTCV;
        marketingLead = marketingLeadTCV;
        accountMining = accountMiningTCV;
        referral = referralTCV;
      };
      recentEntries;
      upcomingClosings;
    };
  };

  func dateFromDays(days : Nat) : Text {
    let year = 1970 + (days / 365);
    let dayOfYear = days % 365;
    let month = (dayOfYear / 30) + 1;
    let day = (dayOfYear % 30) + 1;
    year.toText() # "-" #
    formatTwoDigits(month) # "-" #
    formatTwoDigits(day);
  };

  func addDaysToDate(date : Text, days : Nat) : Text {
    let year = 1970 + (days / 365);
    let dayOfYear = days % 365;
    let month = (dayOfYear / 30) + 1;
    let day = (dayOfYear % 30) + 1;
    year.toText() # "-" #
    formatTwoDigits(month) # "-" #
    formatTwoDigits(day);
  };

  func formatTwoDigits(n : Nat) : Text {
    if (n < 10) { "0" # n.toText() } else { n.toText() };
  };
};
