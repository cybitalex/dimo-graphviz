import { gql } from 'graphql-request'




self.deviceFullQuery = gql`query graphvizDeviceQuery($device_id: String!) {
  device(where: {id: {_eq: $device_id}}) {
    added_by
    added_on
    assigned_to
    cost
    description
    wallet_address
    valid
    tags
    notes
    name
    marketing_description
    listing_url
    last_modified_on
    last_modified_by
    image
    id
    device_device_types {
      device_type {
        id
        name
        icon
      }
    }
    device_functions {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
        people_functions {
          person {
            id
          }
        }
      }
    }
    device_oem_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
    device_sp_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
    project_devices {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
        people_projects {
          person {
            id
          }
        }
      }
    }
    people_devices {
      person {
        added_by
        added_on
        birthday
        calendar_link
        discord_username
        first_name
        full_name
        geocode
        github
        id
        last_modified_on
        last_modified_by
        last_name
        link_score
        linkedn
        location
        newsletter_subscriber
        occupation
        onboard_assigned_to
        paypal
        osm_profile
        phone
        photo
        sample_project
        tags
        twitter_profile
        title
        wallet_address
        valid
        user_onboarding
        upvotes
        people_people_types {
          people_type {
            id
            name
            icon
          }
        }
        org_people {
          organization {
            id
          }
        }
        people_devices {
          device {
            id
          }
        }
        people_functions {
          function {
            id
          }
        }
        people_projects {
          project {
            id
          }
        }
      }
    }
  }
}`

self.deviceSearchQuery = gql`query graphVizDeviceSearchQuery($searchString: String!) {
  device(where: {name: {_ilike: $searchString}}) {
    added_by
    added_on
    assigned_to
    cost
    description
    wallet_address
    valid
    tags
    notes
    name
    marketing_description
    listing_url
    last_modified_on
    last_modified_by
    image
    id
    device_device_types {
      device_type {
        id
        name
        icon
      }
    }
    device_functions {
      function {
        id
        name
      }
    }
    device_oem_orgs {
      organization {
        id
        name
      }
    }
    device_sp_orgs {
      organization {
        id
        name
      }
    }
    project_devices {
      project {
        id
        name
      }
    }
    people_devices {
      person {
        full_name
        id
      }
    }
  }
}`














self.projectFullQuery = gql`query graphvizProjectQuery($proj_id: String!) {
  project(where: {id: {_eq: $proj_id}}) {
    access
    added_by
    added_on
    anchor_address
    area_image
    assigned_to
    contacts
    cover_photo
    dimo_rating
    description
    geocode_cache
    geospatial_data
    id
    import_source_url
    name
    last_modified_on
    last_modified_by
    tags
    sla
    regulator_orgs
    project_screenshots
    zone_area_kml
    wallet_address
    version_history
    valid
    underwriting_model
    thumbnail
    project_website
    project_project_types {
      project_type {
        id
        icon
        name
      }
    }
    function_projects {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
        people_functions {
          person {
            id
          }
        }
      }
    }
    org_projects {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
    project_devices {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
        people_devices {
          person {
            id
          }
        }
      }
    }
    project_resources {
      resource {
        id
        added_by
        added_on
        additional_parking
        attachments
        available_by
        break_room_sq_ft
        classroom_sq_ft
        dedicated_bathrooms
        icon
        geocode
        description
        monthly_rent
        max_classroom_space
        lease_min
        location
        last_modified_on
        last_modified_by
        kitchenette
        notes
        name
        parking_spaces
        number_of_charging_plugs
        recommendation
        secured_parking
        simultaneous_trainees
        status
        tags
        virtual_tour
        valid
        usable_sq_ft
        resource_resource_types {
          resource_type {
            name
            id
            icon
          }
        }
        project_resources {
          project {
            id
            name
          }
        }
        functions_resources {
          function {
            id
            name
          }
        }
        org_resources {
          organization {
            id
            name
          }
        }
      }
    }
    people_projects {
      person {
        added_by
        added_on
        birthday
        calendar_link
        discord_username
        first_name
        full_name
        geocode
        github
        id
        last_modified_on
        last_modified_by
        last_name
        link_score
        linkedn
        location
        newsletter_subscriber
        occupation
        onboard_assigned_to
        paypal
        osm_profile
        phone
        photo
        sample_project
        tags
        twitter_profile
        title
        wallet_address
        valid
        user_onboarding
        upvotes
        people_people_types {
          people_type {
            id
            name
            icon
          }
        }
        org_people {
          organization {
            id
          }
        }
        people_devices {
          device {
            id
          }
        }
        people_functions {
          function {
            id
          }
        }
        people_projects {
          project {
            id
          }
        }
      }
    }
  }
}
`
self.projectSearchQuery = gql`query graphVizProjectSearchQuery($searchString: String!) {
  project(where: {name: {_ilike: $searchString}}) {
    access
    added_by
    added_on
    anchor_address
    area_image
    assigned_to
    contacts
    cover_photo
    dimo_rating
    description
    geocode_cache
    geospatial_data
    id
    import_source_url
    name
    last_modified_on
    last_modified_by
    tags
    sla
    regulator_orgs
    project_screenshots
    zone_area_kml
    wallet_address
    version_history
    valid
    underwriting_model
    thumbnail
    project_website
    project_project_types {
      project_type {
        id
        icon
        name
      }
    }
    function_projects {
      function {
        id
        name
      }
    }
    org_projects {
      organization {
        id
        name
      }
    }
    project_devices {
      device {
        id
        name
      }
    }
    people_projects {
      person {
        full_name
        id
      }
    }
    project_resources {
      resource {
        id
        name
      }
    }
  }
}`







self.orgFullQuery = gql`query graphvizOrgQuery($org_id: String!) {
  organization(where: {id: {_eq: $org_id}}) {
    added_by
    added_on
    assigned_to
    bd_tier
    category_example
    capital_raised
    crunchbase_profile
    company_tagline
    company_email
    devices_page
    employees
    functions_page
    github
    headquarters
    id
    job_board_used
    job_board_link_status
    last_modified_by
    last_modified_on
    logo
    linkedn
    name
    naics_code
    logo_url
    org_chart_link
    product_picture
    website
    wallet_address
    valid
    twitter_handle
    team_page_url
    tags
    summary_video
    sales_outreach
    product_service_description
    org_org_types {
      org_type {
        icon
        name
        id
      }
    }
    device_oem_orgs {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
        people_devices {
          person {
            id
          }
        }
      }
    }
    device_sp_orgs {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
        people_devices {
          person {
            id
          }
        }
      }
    }
    function_sp_orgs {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
        people_functions {
          person {
            id
          }
        }
      }
    }
    org_projects {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
        people_projects {
          person {
            id
          }
        }
      }
    }
    org_resources {
      resource {
        id
        added_by
        added_on
        additional_parking
        attachments
        available_by
        break_room_sq_ft
        classroom_sq_ft
        dedicated_bathrooms
        icon
        geocode
        description
        monthly_rent
        max_classroom_space
        lease_min
        location
        last_modified_on
        last_modified_by
        kitchenette
        notes
        name
        parking_spaces
        number_of_charging_plugs
        recommendation
        secured_parking
        simultaneous_trainees
        status
        tags
        virtual_tour
        valid
        usable_sq_ft
        resource_resource_types {
          resource_type {
            name
            id
            icon
          }
        }
        project_resources {
          project {
            id
            name
          }
        }
        functions_resources {
          function {
            id
            name
          }
        }
        org_resources {
          organization {
            id
            name
          }
        }
      }
    }
    org_people {
      person {
        added_by
        added_on
        birthday
        calendar_link
        discord_username
        first_name
        full_name
        geocode
        github
        id
        last_modified_on
        last_modified_by
        last_name
        link_score
        linkedn
        location
        newsletter_subscriber
        occupation
        onboard_assigned_to
        paypal
        osm_profile
        phone
        photo
        sample_project
        tags
        twitter_profile
        title
        wallet_address
        valid
        user_onboarding
        upvotes
        people_people_types {
          people_type {
            id
            name
            icon
          }
        }
        org_people {
          organization {
            id
          }
        }
        people_devices {
          device {
            id
          }
        }
        people_functions {
          function {
            id
          }
        }
        people_projects {
          project {
            id
          }
        }
      }
    }
    from_org_rels {
      id
      relationship_type
      to_org {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
    to_org_rels {
      id
      relationship_type
      from_org {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
  }
}`

self.orgSearchQuery = gql`query graphvizOrgSearchQuery($searchString: String!) {
  organization(where: {name: {_ilike: $searchString}}) {
    added_by
    added_on
    assigned_to
    bd_tier
    category_example
    capital_raised
    crunchbase_profile
    company_tagline
    company_email
    devices_page
    employees
    functions_page
    github
    headquarters
    id
    job_board_used
    job_board_link_status
    last_modified_by
    last_modified_on
    logo
    linkedn
    name
    naics_code
    logo_url
    org_chart_link
    product_picture
    website
    wallet_address
    valid
    twitter_handle
    team_page_url
    tags
    summary_video
    sales_outreach
    product_service_description
    org_org_types {
      org_type {
        icon
        name
        id
      }
    }
    device_oem_orgs {
      device {
        id
        name
      }
    }
    device_sp_orgs {
      device {
        id
        name
      }
    }
    function_sp_orgs {
      function {
        name
        id
      }
    }
    org_projects {
      project {
        id
        name
      }
    }
    org_people {
      person {
        full_name
        id
      }
    }
    org_resources {
        resource {
            id
            name
        }
    }
    from_org_rels {
      id
      relationship_type
      to_org {
        id
      }
      from_org {
        id
      }
    }
    to_org_rels {
      relationship_type
      id
      from_org {
        id
      }
      to_org {
        id
      }
    }
  }
}

`






self.functionFullQuery = gql`query graphvizFunctionQuery($function_id: String!) {
  function(where: {id: {_eq: $function_id}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    cover_photo
    cost_model
    blueprint_url
    blueprint_file
    description
    name
    ongoing_monthly_subscription
    last_modified_on
    last_modified_by
    id
    icon
    github
    priority
    wallet_address
    valid
    upfront_price_credits_to_engage
    tags
    source_url
    size
    sample_output
    function_function_types {
      function_type {
        icon
        id
        name
      }
    }
    device_functions {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
        people_devices {
          person {
            id
          }
        }
      }
    }
    function_projects {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
        people_projects {
          person {
            id
          }
        }
      }
    }
    function_sp_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
    functions_resources {
      resource {
        id
        added_by
        added_on
        additional_parking
        attachments
        available_by
        break_room_sq_ft
        classroom_sq_ft
        dedicated_bathrooms
        icon
        geocode
        description
        monthly_rent
        max_classroom_space
        lease_min
        location
        last_modified_on
        last_modified_by
        kitchenette
        notes
        name
        parking_spaces
        number_of_charging_plugs
        recommendation
        secured_parking
        simultaneous_trainees
        status
        tags
        virtual_tour
        valid
        usable_sq_ft
        resource_resource_types {
          resource_type {
            name
            id
            icon
          }
        }
        project_resources {
          project {
            id
            name
          }
        }
        functions_resources {
          function {
            id
            name
          }
        }
        org_resources {
          organization {
            id
            name
          }
        }
      }
    }
    people_functions {
      person {
        added_by
        added_on
        birthday
        calendar_link
        discord_username
        first_name
        full_name
        geocode
        github
        id
        last_modified_on
        last_modified_by
        last_name
        link_score
        linkedn
        location
        newsletter_subscriber
        occupation
        onboard_assigned_to
        paypal
        osm_profile
        phone
        photo
        sample_project
        tags
        twitter_profile
        title
        wallet_address
        valid
        user_onboarding
        upvotes
        people_people_types {
          people_type {
            id
            name
            icon
          }
        }
        org_people {
          organization {
            id
          }
        }
        people_devices {
          device {
            id
          }
        }
        people_functions {
          function {
            id
          }
        }
        people_projects {
          project {
            id
          }
        }
      }
    }
  }
}`

self.functionSearchQuery = gql`query graphvizFunctionSearchQuery($searchString: String!) {
  function(where: {name: {_ilike: $searchString}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    cover_photo
    cost_model
    blueprint_url
    blueprint_file
    description
    name
    ongoing_monthly_subscription
    last_modified_on
    last_modified_by
    id
    icon
    github
    priority
    wallet_address
    valid
    upfront_price_credits_to_engage
    tags
    source_url
    size
    sample_output
    function_function_types {
      function_type {
        icon
        id
        name
      }
    }
    device_functions {
      device {
        name
        id
      }
    }
    function_projects {
      project {
        name
        id
      }
    }
    function_sp_orgs {
      organization {
        name
        id
      }
    }
    people_functions {
      person {
        id
        full_name
      }
    }
    functions_resources {
        resource {
            name
            id
        }
    }
  }
}

`



self.resourceFullQuery = gql`query graphvizResourceQuery($resource_id: String!) {
  resource(where: {id: {_eq: $resource_id}}) {
    id
    added_by
    added_on
    additional_parking
    attachments
    available_by
    break_room_sq_ft
    classroom_sq_ft
    dedicated_bathrooms
    icon
    geocode
    description
    monthly_rent
    max_classroom_space
    lease_min
    location
    last_modified_on
    last_modified_by
    kitchenette
    notes
    name
    parking_spaces
    number_of_charging_plugs
    recommendation
    secured_parking
    simultaneous_trainees
    status
    tags
    virtual_tour
    valid
    usable_sq_ft
    resource_resource_types {
      resource_type {
        name
        id
        icon
      }
    }
    project_resources {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
        people_projects {
          person {
            id
          }
        }
      }
    }
    functions_resources {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
        people_functions {
          person {
            id
          }
        }
      }
    }
    org_resources {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
  }
}`

self.resourceSearchQuery = gql`query graphvizResourceSearchQuery($searchString: String!) {
  resource(where: {name: {_ilike: $searchString}}) {
    id
    added_by
    added_on
    additional_parking
    attachments
    available_by
    break_room_sq_ft
    classroom_sq_ft
    dedicated_bathrooms
    icon
    geocode
    description
    monthly_rent
    max_classroom_space
    lease_min
    location
    last_modified_on
    last_modified_by
    kitchenette
    notes
    name
    parking_spaces
    number_of_charging_plugs
    recommendation
    secured_parking
    simultaneous_trainees
    status
    tags
    virtual_tour
    valid
    usable_sq_ft
    resource_resource_types {
      resource_type {
        name
        id
        icon
      }
    }
    project_resources {
      project {
        id
        name
      }
    }
    functions_resources {
      function {
        id
        name
      }
    }
    org_resources {
      organization {
        id
        name
      }
    }
  }
}`




self.peopleFullQuery = gql`query graphvizPeopleQuery($person_id: String!) {
  people(where: {id: {_eq: $person_id}}) {
    added_by
    added_on
    birthday
    calendar_link
    discord_username
    first_name
    full_name
    geocode
    github
    id
    last_modified_on
    last_modified_by
    last_name
    link_score
    linkedn
    location
    newsletter_subscriber
    occupation
    onboard_assigned_to
    paypal
    osm_profile
    phone
    photo
    sample_project
    tags
    twitter_profile
    title
    wallet_address
    valid
    user_onboarding
    upvotes
    people_people_types {
      people_type {
        id
        name
        icon
      }
    }
    org_people {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
        org_people {
          person {
            id
          }
        }
        from_org_rels {
          id
          relationship_type
          to_org {
            id
          }
          from_org {
            id
          }
        }
        to_org_rels {
          relationship_type
          id
          from_org {
            id
          }
          to_org {
            id
          }
        }
      }
    }
    people_devices {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
        people_devices {
          person {
            id
          }
        }
      }
    }
    people_functions {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
        people_functions {
          person {
            id
          }
        }
      }
    }
    people_projects {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
        people_projects {
          person {
            id
          }
        }
      }
    }
  }
}`


self.peopleSearchQuery = gql`query graphvizPeopleSearchQuery($searchString: String!) {
  people(where: {full_name: {_ilike: $searchString}}) {
    added_by
    added_on
    birthday
    calendar_link
    discord_username
    first_name
    full_name
    geocode
    github
    id
    last_modified_on
    last_modified_by
    last_name
    link_score
    linkedn
    location
    newsletter_subscriber
    occupation
    onboard_assigned_to
    paypal
    osm_profile
    phone
    photo
    sample_project
    tags
    twitter_profile
    title
    wallet_address
    valid
    user_onboarding
    upvotes
    people_people_types {
      people_type {
        id
        name
        icon
      }
    }
    org_people {
      organization {
        id
      }
    }
    people_devices {
      device {
        id
      }
    }
    people_functions {
      function {
        id
      }
    }
    people_projects {
      project {
        id
      }
    }
    
  }
}`

